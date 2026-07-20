export const BACKGROUND_STATE_VERSION = 1;
export const BACKGROUND_STORAGE_KEY = 'site-background-state-v1';

export function backgroundSignature(entries) {
  return JSON.stringify(entries.map(({ image, textPosition, backgroundPosition }) => [
    image,
    textPosition,
    backgroundPosition,
  ]));
}

export function shuffledIndices(length, previousIndex = -1, random = Math.random) {
  const indices = Array.from({ length }, (_, index) => index);
  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [indices[index], indices[swapIndex]] = [indices[swapIndex], indices[index]];
  }

  if (length > 1 && indices[0] === previousIndex) {
    const replacementIndex = indices.findIndex((value) => value !== previousIndex);
    [indices[0], indices[replacementIndex]] = [indices[replacementIndex], indices[0]];
  }
  return indices;
}

export function createRotationState(length, signature, interval, random = Math.random) {
  const queue = shuffledIndices(length, -1, random);
  return {
    version: BACKGROUND_STATE_VERSION,
    signature,
    current: queue.shift() ?? 0,
    queue,
    remainingMs: interval,
    nextAt: null,
  };
}

export function advanceRotationState(state, length, interval, random = Math.random) {
  const queue = state.queue.length > 0
    ? [...state.queue]
    : shuffledIndices(length, state.current, random);
  return {
    ...state,
    current: queue.shift() ?? state.current,
    queue,
    remainingMs: interval,
    nextAt: null,
  };
}

export function parseRotationState(raw, signature, length, interval, now = Date.now()) {
  if (!raw || length < 1) return null;

  let state;
  try {
    state = JSON.parse(raw);
  } catch {
    return null;
  }

  const validQueue = Array.isArray(state.queue)
    && state.queue.every((index) => Number.isInteger(index) && index >= 0 && index < length)
    && new Set(state.queue).size === state.queue.length
    && !state.queue.includes(state.current);
  if (
    state.version !== BACKGROUND_STATE_VERSION
    || state.signature !== signature
    || !Number.isInteger(state.current)
    || state.current < 0
    || state.current >= length
    || !validQueue
  ) return null;

  const storedRemaining = Number.isFinite(state.remainingMs)
    ? Math.max(0, Math.min(state.remainingMs, interval))
    : interval;
  const remainingMs = Number.isFinite(state.nextAt)
    ? Math.max(0, Math.min(state.nextAt - now, interval))
    : storedRemaining;

  return {
    version: BACKGROUND_STATE_VERSION,
    signature,
    current: state.current,
    queue: [...state.queue],
    remainingMs,
    nextAt: Number.isFinite(state.nextAt) ? state.nextAt : null,
  };
}
