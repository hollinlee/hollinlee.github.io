export function contentSlug(id: string) {
  return id.replace(/\/index$/, '');
}

export function contentId(collection: string, id: string) {
  return `${collection}/${contentSlug(id)}`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function estimateReadingMinutes(body: string) {
  const readable = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .trim();
  const cjkCharacters = (readable.match(/[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/g) ?? []).length;
  const latinWords = (readable.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? []).length;
  return Math.max(1, Math.ceil(cjkCharacters / 350 + latinWords / 200));
}

export function siteAgeInDays(startDate: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const current = parts.reduce<Record<string, string>>((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const today = Date.UTC(Number(current.year), Number(current.month) - 1, Number(current.day));
  if (!Number.isFinite(start) || today < start) return 1;
  return Math.floor((today - start) / 86_400_000) + 1;
}

const projectStatusLabels = {
  active: '活跃维护',
  experimental: '实验中',
  maintained: '维护中',
  archived: '已归档',
} as const;

export function projectStatusLabel(status: keyof typeof projectStatusLabels) {
  return projectStatusLabels[status];
}
