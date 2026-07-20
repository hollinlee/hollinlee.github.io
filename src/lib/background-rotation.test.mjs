import assert from 'node:assert/strict';
import test from 'node:test';
import {
  advanceRotationState,
  backgroundSignature,
  createRotationState,
  parseRotationState,
  shuffledIndices,
} from './background-rotation.mjs';

const entries = [
  { image: '/a.webp', textPosition: 'left', backgroundPosition: 'center' },
  { image: '/b.webp', textPosition: 'right', backgroundPosition: '40% 50%' },
  { image: '/c.webp', textPosition: 'center', backgroundPosition: 'center' },
];
const signature = backgroundSignature(entries);
const interval = 45_000;

test('shuffle includes every index once and avoids an immediate repeat', () => {
  const values = [0.99, 0.99];
  const shuffled = shuffledIndices(3, 0, () => values.shift() ?? 0.99);
  assert.deepEqual([...shuffled].sort(), [0, 1, 2]);
  assert.notEqual(shuffled[0], 0);
});

test('rotation consumes a complete cycle before reshuffling', () => {
  let state = createRotationState(3, signature, interval, () => 0.5);
  const firstCycle = [state.current];
  while (state.queue.length > 0) {
    state = advanceRotationState(state, 3, interval, () => 0.5);
    firstCycle.push(state.current);
  }
  assert.deepEqual([...firstCycle].sort(), [0, 1, 2]);

  const previous = state.current;
  state = advanceRotationState(state, 3, interval, () => 0.5);
  assert.notEqual(state.current, previous);
});

test('stored state restores remaining time from nextAt', () => {
  const raw = JSON.stringify({
    version: 1,
    signature,
    current: 1,
    queue: [2],
    remainingMs: interval,
    nextAt: 120_000,
  });
  const restored = parseRotationState(raw, signature, 3, interval, 100_000);
  assert.equal(restored?.current, 1);
  assert.equal(restored?.remainingMs, 20_000);
});

test('invalid, stale, and corrupt state is rejected', () => {
  assert.equal(parseRotationState('{', signature, 3, interval), null);
  assert.equal(parseRotationState(JSON.stringify({
    version: 1,
    signature: 'stale',
    current: 0,
    queue: [1, 2],
  }), signature, 3, interval), null);
  assert.equal(parseRotationState(JSON.stringify({
    version: 1,
    signature,
    current: 0,
    queue: [0, 2],
  }), signature, 3, interval), null);
});
