import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';

const root = resolve(import.meta.dirname, '..');
const contentTarget = resolve(root, 'src/content');
const dataTarget = resolve(root, 'src/content-data');
const assetsTarget = resolve(root, 'public/content-assets');
const astroCache = resolve(root, '.astro');
const astroDataStore = resolve(root, 'node_modules/.astro');
const buildOutput = resolve(root, 'dist');
const tempSource = resolve(root, '.content-source');
const exampleSource = resolve(root, 'examples/content');
const collections = ['posts', 'notes', 'projects', 'logs', 'now', 'pages'];

loadLocalEnv();

const repository = process.env.CONTENT_REPO_URL?.trim();
const branch = process.env.CONTENT_REPO_BRANCH?.trim() || 'main';
const token = process.env.CONTENT_REPO_TOKEN?.trim();
let source = exampleSource;

try {
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
  const dataSource = resolve(source, 'data');
  assertDirectory(published, 'Published content');
  assertDirectory(dataSource, 'Public data');

  // Astro and build caches can retain entries removed from an external source.
  // Clear all generated targets before copying so content never leaks across builds.
  for (const target of [astroCache, astroDataStore, buildOutput, contentTarget, dataTarget, assetsTarget]) {
    rmSync(target, { recursive: true, force: true });
  }

  mkdirSync(contentTarget, { recursive: true });
  for (const collection of collections) {
    const target = resolve(contentTarget, collection);
    const input = resolve(published, collection);
    mkdirSync(target, { recursive: true });
    if (existsSync(input)) cpSync(input, target, { recursive: true });
  }

  mkdirSync(assetsTarget, { recursive: true });
  const assetsSource = resolve(published, 'assets');
  if (existsSync(assetsSource)) cpSync(assetsSource, assetsTarget, { recursive: true });

  mkdirSync(dataTarget, { recursive: true });
  cpSync(dataSource, dataTarget, { recursive: true });

  const profile = readYaml(dataSource, 'profile.yml');
  const site = readYaml(dataSource, 'site.yml');
  const backgrounds = readYaml(dataSource, 'backgrounds.yml');
  const projectState = readYaml(dataSource, 'project-state.yml');

  validateProfile(profile);
  validateSite(site);
  validateBackgrounds(backgrounds);
  validateProjectState(projectState);
  validatePublishedAssetReferences(profile, backgrounds, assetsSource);

  writeJson('profile.json', profile);
  writeJson('site.json', site);
  writeJson('backgrounds.json', backgrounds);
  writeJson('project-state.json', projectState);

  const aboutPage = resolve(published, 'pages/about.md');
  if (!existsSync(aboutPage)) {
    throw new Error('Required published page not found: published/pages/about.md');
  }

  console.log('[content] Sync complete. Only published/ and data/ were imported.');
} finally {
  rmSync(tempSource, { recursive: true, force: true });
}

function readYaml(directory, filename) {
  const file = resolve(directory, filename);
  if (!existsSync(file)) throw new Error(`Required public data file not found: data/${filename}`);
  const value = parse(readFileSync(file, 'utf8'));
  if (!isRecord(value)) throw new Error(`Expected data/${filename} to contain a YAML object.`);
  return value;
}

function writeJson(filename, value) {
  writeFileSync(resolve(dataTarget, filename), `${JSON.stringify(value, null, 2)}\n`);
}

function validateProfile(profile) {
  assertAllowedKeys(profile, ['name', 'handle', 'avatar', 'links'], 'profile');
  assertString(profile.name, 'profile.name');
  assertString(profile.handle, 'profile.handle');
  assertContentAssetPath(profile.avatar, 'profile.avatar');
  assertRecord(profile.links, 'profile.links');
  assertAllowedKeys(profile.links, ['github', 'email'], 'profile.links');
  assertRecord(profile.links.github, 'profile.links.github');
  assertRecord(profile.links.email, 'profile.links.email');

  for (const [key, link] of Object.entries(profile.links)) {
    assertRecord(link, `profile.links.${key}`);
    assertAllowedKeys(link, ['label', 'url'], `profile.links.${key}`);
    assertString(link.label, `profile.links.${key}.label`);
    assertString(link.url, `profile.links.${key}.url`);
    if (!isPublicLink(link.url)) {
      throw new Error(`profile.links.${key}.url must use https: or mailto:.`);
    }
  }
}

function validateSite(site) {
  assertAllowedKeys(site, ['title', 'subtitle', 'language', 'emptyStates'], 'site');
  assertString(site.title, 'site.title');
  assertString(site.subtitle, 'site.subtitle');
  assertString(site.language, 'site.language');

  if (site.emptyStates !== undefined) {
    assertAllowedKeys(site.emptyStates, ['articlesTitle', 'articlesDescription'], 'site.emptyStates');
    assertString(site.emptyStates.articlesTitle, 'site.emptyStates.articlesTitle');
    assertString(site.emptyStates.articlesDescription, 'site.emptyStates.articlesDescription');
  }
}

function validateBackgrounds(backgrounds) {
  assertAllowedKeys(backgrounds, ['rotationInterval', 'transitionDuration', 'blur', 'day', 'night'], 'backgrounds');
  assertNumberInRange(backgrounds.rotationInterval, 'backgrounds.rotationInterval', 10000, 300000);
  assertNumberInRange(backgrounds.transitionDuration, 'backgrounds.transitionDuration', 0, 10000);
  assertNumberInRange(backgrounds.blur, 'backgrounds.blur', 0, 30);

  for (const mode of ['day', 'night']) {
    const entries = backgrounds[mode];
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error(`backgrounds.${mode} must be a non-empty array.`);
    }
    entries.forEach((entry, index) => {
      const path = `backgrounds.${mode}[${index}]`;
      assertRecord(entry, path);
      assertAllowedKeys(entry, ['image', 'textPosition', 'backgroundPosition'], path);
      assertContentAssetPath(entry.image, `${path}.image`);
      if (!['left', 'right', 'center'].includes(entry.textPosition)) {
        throw new Error(`${path}.textPosition must be left, right or center.`);
      }
      assertString(entry.backgroundPosition, `${path}.backgroundPosition`);
    });
  }
}

function validateProjectState(projectState) {
  assertAllowedKeys(projectState, ['enabled', 'emptyTitle', 'emptyDescription'], 'projectState');
  if (projectState.enabled !== undefined && typeof projectState.enabled !== 'boolean') {
    throw new Error('projectState.enabled must be a boolean.');
  }
  assertString(projectState.emptyTitle, 'projectState.emptyTitle');
  if (typeof projectState.emptyDescription !== 'string') {
    throw new Error('projectState.emptyDescription must be a string.');
  }
}

function validatePublishedAssetReferences(profile, backgrounds, assetsSource) {
  const references = [
    profile.avatar,
    ...backgrounds.day.map((entry) => entry.image),
    ...backgrounds.night.map((entry) => entry.image),
  ];

  for (const publicPath of references) {
    const relative = publicPath.slice('/content-assets/'.length);
    const file = resolve(assetsSource, relative);
    if (!existsSync(file)) throw new Error(`Referenced published asset not found: ${publicPath}`);
  }
}

function assertDirectory(directory, label) {
  if (!existsSync(directory)) throw new Error(`${label} directory not found: ${directory}`);
}

function assertRecord(value, path) {
  if (!isRecord(value)) throw new Error(`${path} must be an object.`);
}

function assertAllowedKeys(value, allowedKeys, path) {
  assertRecord(value, path);
  const unexpected = Object.keys(value).filter((key) => !allowedKeys.includes(key));
  if (unexpected.length > 0) {
    throw new Error(`${path} contains unsupported fields: ${unexpected.join(', ')}.`);
  }
}

function assertString(value, path) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${path} must be a non-empty string.`);
}

function assertContentAssetPath(value, path) {
  assertString(value, path);
  if (!value.startsWith('/content-assets/') || value.includes('..')) {
    throw new Error(`${path} must be an absolute /content-assets/ path.`);
  }
}

function assertNumberInRange(value, path, min, max) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${path} must be a number between ${min} and ${max}.`);
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPublicLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'mailto:';
  } catch {
    return false;
  }
}

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
