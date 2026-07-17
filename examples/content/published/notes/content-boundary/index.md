---
title: "Separate public content from private notes"
description: "Use an explicit directory boundary instead of relying on theme-specific frontmatter to prevent accidental publication."
publishedAt: 2026-07-17
tags:
  - content
  - privacy
lang: en
---

The production build reads only `published/` and `data/`. Drafts and private notes are never copied into the website workspace.
