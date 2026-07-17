import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const contentTarget = resolve(root, 'src/content');
const dataTarget = resolve(root, 'src/content-data');
const astroCache = resolve(root, '.astro');
const astroDataStore = resolve(root, 'node_modules/.astro');
const buildOutput = resolve(root, 'dist');
const tempSource = resolve(root, '.content-source');
const exampleSource = resolve(root, 'examples/content');
const collections = ['posts', 'notes', 'projects', 'logs', 'now'];

loadLocalEnv();

const repository = process.env.CONTENT_REPO_URL?.trim();
const branch = process.env.CONTENT_REPO_BRANCH?.trim() || 'main';
const token = process.env.CONTENT_REPO_TOKEN?.trim();

let source = exampleSource;

if (repository) {
  rmSync(tempSource, { recursive: true, force: true });
  const cloneUrl = authenticatedUrl(repository, token);
  console.log(`[content] Cloning external content (${branch}).`);
  execFileSync('git', ['clone', '--depth=1', '--branch', branch, cloneUrl, tempSource], {
    cwd: root,
    stdio: 'inherit',
  });
  source = tempSource;
} else {
  console.log('[content] CONTENT_REPO_URL is not set; using bundled example content.');
}

const published = resolve(source, 'published');
if (!existsSync(published)) {
  throw new Error(`Published content directory not found: ${published}`);
}

// Astro's content data store can retain entries removed by an external source.
// Clear it before replacing collections so private/example content never leaks across builds.
rmSync(astroCache, { recursive: true, force: true });
rmSync(astroDataStore, { recursive: true, force: true });
rmSync(buildOutput, { recursive: true, force: true });
mkdirSync(contentTarget, { recursive: true });
for (const collection of collections) {
  const target = resolve(contentTarget, collection);
  const input = resolve(published, collection);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  if (existsSync(input)) cpSync(input, target, { recursive: true });
}

rmSync(dataTarget, { recursive: true, force: true });
mkdirSync(dataTarget, { recursive: true });
const dataSource = resolve(source, 'data');
if (existsSync(dataSource)) cpSync(dataSource, dataTarget, { recursive: true });

rmSync(tempSource, { recursive: true, force: true });
console.log('[content] Sync complete. Only published/ and data/ were imported.');

function authenticatedUrl(url, authToken) {
  if (!authToken || !url.startsWith('https://')) return url;
  const parsed = new URL(url);
  parsed.username = 'x-access-token';
  parsed.password = authToken;
  return parsed.toString();
}

function loadLocalEnv() {
  const file = resolve(root, '.env.local');
  if (!existsSync(file)) return;

  for (const rawLine of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
}
