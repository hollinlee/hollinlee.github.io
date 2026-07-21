import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/about/',
  '/archive/',
  '/projects/',
  '/articles/article_1784530800/',
  '/projects/personal-site/',
];
const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 },
];
const themes = ['day', 'night'] as const;

for (const viewport of viewports) {
  for (const theme of themes) {
    test.describe(`${viewport.name} ${theme}`, () => {
      test.use({ viewport });

      for (const route of routes) {
        test(`${route} keeps the environment readable and stable`, async ({ page }, testInfo) => {
          await page.addInitScript((selectedTheme) => {
            localStorage.setItem('site-theme', selectedTheme);
          }, theme);
          await page.goto(route);
          await expect(page.locator('.site-environment')).toBeVisible();
          await expect.poll(() => page.locator('.hero-background-layer.is-active').evaluate(
            (element) => getComputedStyle(element).backgroundImage,
          )).not.toBe('none');

          const metrics = await page.evaluate(() => {
            const environment = document.querySelector<HTMLElement>('.site-environment');
            if (!environment) throw new Error('Missing site environment.');
            const before = environment.getBoundingClientRect();
            scrollTo(0, document.documentElement.scrollHeight);
            const after = environment.getBoundingClientRect();
            return {
              horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
              beforeTop: before.top,
              afterTop: after.top,
              position: getComputedStyle(environment).position,
              pointerEvents: getComputedStyle(environment).pointerEvents,
            };
          });
          expect(metrics.horizontalOverflow).toBeLessThanOrEqual(1);
          expect(metrics.beforeTop).toBe(0);
          expect(metrics.afterTop).toBe(0);
          expect(metrics.position).toBe('fixed');
          expect(metrics.pointerEvents).toBe('none');

          const pixels = await page.locator('.hero-background-layer.is-active').evaluate(async (element) => {
            const value = getComputedStyle(element).backgroundImage;
            const url = value.match(/url\(["']?(.*?)["']?\)/)?.[1];
            if (!url) return { opaque: 0, colors: 0 };
            const image = new Image();
            image.src = url;
            await image.decode();
            const canvas = document.createElement('canvas');
            canvas.width = 24;
            canvas.height = 24;
            const context = canvas.getContext('2d');
            if (!context) return { opaque: 0, colors: 0 };
            context.drawImage(image, 0, 0, 24, 24);
            const data = context.getImageData(0, 0, 24, 24).data;
            const colors = new Set<string>();
            let opaque = 0;
            for (let index = 0; index < data.length; index += 16) {
              if (data[index + 3] > 0) opaque += 1;
              colors.add(`${data[index]},${data[index + 1]},${data[index + 2]},${data[index + 3]}`);
            }
            return { opaque, colors: colors.size };
          });
          expect(pixels.opaque).toBeGreaterThan(20);
          expect(pixels.colors).toBeGreaterThan(1);

          await page.screenshot({
            path: testInfo.outputPath(`${viewport.name}-${theme}-${route.replaceAll('/', '_') || 'home'}.png`),
            fullPage: false,
          });
        });
      }
    });
  }
}

test('reduced motion disables ambient animation and rotation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about/');
  await expect(page.locator('.sakura-layer')).toBeHidden();
  await expect(page.locator('.night-particles')).toBeHidden();
  const state = await page.evaluate(() => JSON.parse(sessionStorage.getItem('site-background-state-v1') ?? 'null'));
  expect(state?.nextAt).toBeNull();
});
