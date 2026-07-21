interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  DB: D1Database;
  ALLOWED_ORIGINS: string;
  RATE_LIMITER?: RateLimiter;
}

type ViewRow = { views: number };

const CONTENT_ID_PATTERN = /^(article|project)\/(article|project)_\d{10,}$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowedOrigin = origin && allowedOrigins(env).has(origin) ? origin : null;

    if (request.method === 'OPTIONS') {
      return allowedOrigin
        ? new Response(null, { status: 204, headers: corsHeaders(allowedOrigin) })
        : json({ error: 'Origin is not allowed.' }, 403);
    }

    if (url.pathname === '/views') {
      if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405, allowedOrigin);
      const row = await env.DB.prepare("SELECT COALESCE(SUM(views), 0) AS views FROM page_views WHERE content_id LIKE 'article/%' OR content_id LIKE 'project/%'")
        .first<ViewRow>();
      return json({ views: row?.views ?? 0 }, 200, allowedOrigin);
    }

    if (!url.pathname.startsWith('/views/')) return json({ error: 'Not found.' }, 404);
    const contentId = parseContentId(url.pathname.slice('/views/'.length));
    if (!contentId) return json({ error: 'Invalid content ID.' }, 400, allowedOrigin);

    if (request.method === 'GET') {
      const row = await env.DB.prepare('SELECT views FROM page_views WHERE content_id = ?')
        .bind(contentId)
        .first<ViewRow>();
      return json({ contentId, views: row?.views ?? 0 }, 200, allowedOrigin);
    }

    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, allowedOrigin);
    if (!allowedOrigin) return json({ error: 'Origin is not allowed.' }, 403);

    if (env.RATE_LIMITER) {
      const rateKey = request.headers.get('CF-Connecting-IP') ?? 'unknown';
      const result = await env.RATE_LIMITER.limit({ key: rateKey });
      if (!result.success) return json({ error: 'Rate limit exceeded.' }, 429, allowedOrigin);
    }

    const updatedAt = new Date().toISOString();
    const row = await env.DB.prepare(`
      INSERT INTO page_views (content_id, views, updated_at)
      VALUES (?, 1, ?)
      ON CONFLICT(content_id) DO UPDATE SET
        views = page_views.views + 1,
        updated_at = excluded.updated_at
      RETURNING views
    `).bind(contentId, updatedAt).first<ViewRow>();

    return json({ contentId, views: row?.views ?? 1 }, 200, allowedOrigin);
  },
};

function allowedOrigins(env: Env) {
  return new Set(env.ALLOWED_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean));
}

function parseContentId(value: string) {
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }
  const match = decoded.match(CONTENT_ID_PATTERN);
  if (!match || match[1] !== match[2]) return null;
  return decoded;
}

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(value: unknown, status = 200, origin: string | null = null) {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
  if (origin) {
    for (const [key, headerValue] of Object.entries(corsHeaders(origin))) headers.set(key, headerValue);
  }
  return Response.json(value, { status, headers });
}
