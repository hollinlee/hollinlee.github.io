export const VIEW_DEDUP_WINDOW_MS = 8 * 60 * 60 * 1000;

export function shouldIncrementView(previousTimestamp, now = Date.now()) {
  if (previousTimestamp === null) return true;
  const previous = Number(previousTimestamp);
  return !Number.isFinite(previous) || previous < 0 || now - previous >= VIEW_DEDUP_WINDOW_MS;
}

export function pageViewUrl(endpoint, contentId) {
  return `${endpoint.replace(/\/$/, '')}/views/${encodeURIComponent(contentId)}`;
}
