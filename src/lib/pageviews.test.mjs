import assert from 'node:assert/strict';
import test from 'node:test';
import {
  pageViewUrl,
  shouldIncrementView,
  totalViewsUrl,
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

test('builds page-view API URLs', () => {
  assert.equal(
    pageViewUrl('https://views.example.com/', 'article/article_1784610630'),
    'https://views.example.com/views/article%2Farticle_1784610630',
  );
  assert.equal(totalViewsUrl('https://views.example.com/'), 'https://views.example.com/views');
});
