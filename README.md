# Forkable Astro Personal Homepage

A static personal homepage, project portfolio and writing site. It deploys to GitHub Pages and can securely import only `published/` from an external private content repository.

## Features

- Astro + TypeScript
- Personal homepage, projects, posts, notes, About and Now pages
- Example content works without external services
- Optional private content repository
- Explicit `published/` boundary: drafts and private notes are never imported
- GitHub Pages deployment
- Responsive design, dark mode and reduced-motion support

## Quick start

```bash
npm install
npm run dev
```

Edit personal information in:

```text
src/config/site.ts
```

Without external content, the site uses:

```text
examples/content/
```

## Connect a private content repository

Create a private repository using this structure:

```text
published/
  posts/
  notes/
  projects/
  logs/
  now/
drafts/
private/
templates/
data/
```

The build imports only `published/` and `data/`.

For local development, copy `.env.example` to `.env.local`:

```bash
CONTENT_REPO_URL=git@github.com:your-name/my-blog-content.git
CONTENT_REPO_BRANCH=main
```

For GitHub Actions, configure:

- Repository variable `CONTENT_REPO_URL`
- Repository variable `CONTENT_REPO_BRANCH`
- Repository secret `CONTENT_DEPLOY_KEY`, containing a read-only SSH deploy key for the private content repository

Alternatively, use an HTTPS repository URL and `CONTENT_REPO_TOKEN` with read-only access.

## Fork and deploy

1. Fork this repository.
2. Rename the fork to `<username>.github.io`.
3. Edit `src/config/site.ts` and `astro.config.mjs`.
4. In repository Settings → Pages, choose **GitHub Actions**.
5. Push to `main` or run the `Deploy website` workflow.
6. Optionally connect a private content repository using the variables and secret above.

## Content frontmatter

See `examples/content/` for complete examples. Supported collections:

- `posts`: long-form writing
- `notes`: focused technical notes
- `projects`: project case studies
- `logs`: public build logs
- `now`: current work and learning

## Privacy model

The sync script never imports `drafts/` or `private/`. Still, do not commit credentials, confidential files or private conversations to any directory intended for publication.

## License

MIT
