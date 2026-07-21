import assert from 'node:assert/strict';
import test from 'node:test';
import {
  pageViewUrl,
  shouldIncrementView,
  VIEW_DEDUP_WINDOW_MS,
} from './pageviews.mjs';

test('deduplicates a view inside the eight-hour window', () => {
  const now = 1_800_000_000_000;
  assert.equal(shouldIncrementView(String(now - VIEW_DEDUP_WINDOW_MS + 1), now), false);
  assert.equal(shouldIncrementView(String(now - VIEW_DEDUP_WINDOW_MS), now), true);
});

test('increments when no valid timestamp exists', () => {
  assert.equal(shouldIncrementView(null), true);
  assert.equal(shouldIncrementView('invalid'), true);
});

test('encodes collection-scoped content IDs', () => {
  assert.equal(
    pageViewUrl('https://views.example.com/', 'note/note_1784610630'),
    'https://views.example.com/views/note%2Fnote_1784610630',
  );
});
