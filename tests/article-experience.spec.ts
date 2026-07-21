import { expect, test, type Page } from '@playwright/test';

const articlePath = '/blog/welcome/';
const markdownPath = '/notes/markdown-fixture/';

async function blockGiscus(page: Page) {
  await page.route('https://giscus.app/**', (route) => route.abort());
}

async function expectNoHorizontalOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(sizes.document).toBeLessThanOrEqual(sizes.viewport + 1);
}

test('direct article entry exposes metadata, tags, comments config and archive fallback', async ({ page }, testInfo) => {
  await page.route('https://giscus.app/client.js', (route) => route.fulfill({
    contentType: 'text/javascript',
    body: '',
  }));
  await page.goto(articlePath);

  await expect(page.locator('article.prose h1')).toHaveCount(1);
  await expect(page.locator('[data-article-return]')).toHaveText('← 返回归档');
  await expect(page.locator('[data-article-return]')).toHaveAttribute('href', '/archive/');
  await expect(page.locator('.article-meta')).toContainText('发布于');
  await expect(page.locator('.article-meta')).toContainText('分钟读完');
  await expect(page.locator('.article-tags a')).toHaveCount(2);
  await expect(page.locator('[data-giscus-host]')).toHaveAttribute('data-repo', 'hollinlee/hollinlee.github.io');
  await expect(page.locator('[data-giscus-host]')).toHaveAttribute('data-category', 'Announcements');
  await expect(page.locator('.site-footer')).toContainText('本站已运行');
  await expect(page.locator('main')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('article-direct-desktop.png'), fullPage: true });
});

test('article return target follows home and archive navigation', async ({ page }) => {
  await blockGiscus(page);
  await page.goto('/');
  await page.locator(`a[href="${articlePath}"]`).first().click();
  await expect(page.locator('[data-article-return]')).toHaveText('← 返回首页');
  await expect(page.locator('[data-article-return]')).toHaveAttribute('href', '/');

  await page.goto('/archive/');
  await page.locator(`a[href="${articlePath}"]`).click();
  await expect(page.locator('[data-article-return]')).toHaveText('← 返回归档');
  await expect(page.locator('[data-article-return]')).toHaveAttribute('href', '/archive/');
});

test.describe('Markdown article rendering', () => {
  for (const viewport of [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'desktop', width: 1440, height: 1000 },
  ]) {
    test(`${viewport.name} renders GFM and KaTeX without page overflow`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.goto(markdownPath);

      await expect(page.locator('article.prose h1')).toHaveText('Markdown 渲染示例');
      await expect(page.locator('.article-meta')).toContainText('更新于');
      await expect(page.locator('article.prose table')).toBeVisible();
      await expect(page.locator('article.prose blockquote')).toBeVisible();
      await expect(page.locator('article.prose input[type="checkbox"]')).toHaveCount(2);
      await expect(page.locator('article.prose pre code')).toBeVisible();
      await expect(page.locator('article.prose .katex')).not.toHaveCount(0);
      await expect(page.locator('.giscus-comments')).toHaveCount(0);
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: testInfo.outputPath(`markdown-${viewport.name}.png`),
        fullPage: true,
      });
    });
  }
});

test('tag navigation selects the matching archive filter', async ({ page }) => {
  await page.goto(markdownPath);
  await page.locator('.article-tags a', { hasText: '#markdown' }).click();
  await expect(page).toHaveURL(/\/archive\/\?tag=markdown$/);
  await expect(page.locator('[data-tag-value="markdown"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-archive-status]')).toContainText('#markdown');
});

test('blocked comment service does not hide article content', async ({ page }) => {
  await blockGiscus(page);
  await page.goto(articlePath);
  await expect(page.locator('article.prose h1')).toBeVisible();
  await expect(page.locator('article.prose > p').last()).toBeVisible();
});

test('removed private placeholders are absent from the fallback archive', async ({ page }) => {
  await page.goto('/archive/');
  await expect(page.getByText('把个人网站重建为公开索引')).toHaveCount(0);
  await expect(page.getByText('从 Private GitHub repository 拉取可发布内容')).toHaveCount(0);
});
