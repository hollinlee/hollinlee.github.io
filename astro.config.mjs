// @ts-check
import process from 'node:process';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const fileEnv = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const env = { ...fileEnv, ...process.env };
const [owner, repository] = (env.GITHUB_REPOSITORY ?? '').split('/');
const githubPagesUrl = owner
  ? repository === `${owner}.github.io`
    ? `https://${owner}.github.io`
    : `https://${owner}.github.io/${repository}`
  : undefined;

export default defineConfig({
  site: env.SITE_URL || githubPagesUrl || 'https://example.com',
  output: 'static',
  trailingSlash: 'always',
});
