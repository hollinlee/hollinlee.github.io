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

const projectStatusLabels = {
  active: '活跃维护',
  experimental: '实验中',
  maintained: '维护中',
  archived: '已归档',
} as const;

export function projectStatusLabel(status: keyof typeof projectStatusLabels) {
  return projectStatusLabels[status];
}
