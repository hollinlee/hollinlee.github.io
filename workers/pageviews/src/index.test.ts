import { describe, expect, it } from 'vitest';
import worker from './index';

const origin = 'https://hollinlee.github.io';
const contentId = 'article/article_1784610630';

class FakeStatement {
  constructor(
    private database: FakeDatabase,
    private query: string,
    private values: unknown[] = [],
  ) {}

  bind(...values: unknown[]) {
    return new FakeStatement(this.database, this.query, values);
  }

  async first<T>() {
    const id = String(this.values[0]);
    if (this.query.includes('SELECT views')) {
      const views = this.database.rows.get(id);
      return (views === undefined ? null : { views }) as T | null;
    }
    if (this.query.includes('INSERT INTO page_views')) {
      const views = (this.database.rows.get(id) ?? 0) + 1;
      this.database.rows.set(id, views);
      return { views } as T;
    }
    throw new Error(`Unexpected query: ${this.query}`);
  }
}

class FakeDatabase {
  rows = new Map<string, number>();

  prepare(query: string) {
    return new FakeStatement(this, query) as unknown as D1PreparedStatement;
  }
}

function env(options: { rateLimitSuccess?: boolean } = {}) {
  return {
    DB: new FakeDatabase() as unknown as D1Database,
    ALLOWED_ORIGINS: origin,
    RATE_LIMITER: {
      limit: async () => ({ success: options.rateLimitSuccess ?? true }),
    },
  };
}

function request(method: string, id = contentId, requestOrigin = origin) {
  return new Request(`https://views.example.com/views/${encodeURIComponent(id)}`, {
    method,
    headers: requestOrigin ? { Origin: requestOrigin, 'CF-Connecting-IP': '192.0.2.1' } : {},
  });
}

describe('page-view worker', () => {
  it('returns zero for an unknown content ID', async () => {
    const response = await worker.fetch(request('GET'), env());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ contentId, views: 0 });
  });

  it('increments a content ID atomically', async () => {
    const bindings = env();
    const responses = await Promise.all([
      worker.fetch(request('POST'), bindings),
      worker.fetch(request('POST'), bindings),
      worker.fetch(request('POST'), bindings),
    ]);
    const counts = await Promise.all(responses.map(async (response) => (await response.json() as { views: number }).views));
    expect(counts.sort((left, right) => left - right)).toEqual([1, 2, 3]);
    const read = await worker.fetch(request('GET'), bindings);
    await expect(read.json()).resolves.toEqual({ contentId, views: 3 });
  });

  it('rejects invalid content IDs', async () => {
    const response = await worker.fetch(request('GET', 'article/chinese-title'), env());
    expect(response.status).toBe(400);
  });

  it('rejects write requests from other origins', async () => {
    const response = await worker.fetch(request('POST', contentId, 'https://attacker.example'), env());
    expect(response.status).toBe(403);
  });

  it('returns 429 when the rate limiter rejects a write', async () => {
    const response = await worker.fetch(request('POST'), env({ rateLimitSuccess: false }));
    expect(response.status).toBe(429);
  });

  it('answers preflight requests for an allowed origin', async () => {
    const response = await worker.fetch(request('OPTIONS'), env());
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
  });
});
