---
title: "Forkable Personal Homepage"
summary: "An Astro personal homepage that can securely pull publishable Markdown from a private content repository."
status: active
featured: true
order: 1
repo: "https://github.com/hollinlee/hollinlee.github.io"
demo: "https://hollinlee.github.io"
startedAt: 2026-07-17
stack:
  - Astro
  - TypeScript
  - GitHub Actions
---

## Problem

Personal sites often mix presentation code, drafts and published writing in one repository.

## Solution

This template keeps the website public and reusable while importing only `published/` from an optional private content repository during the build.

## Result

A fork can deploy immediately with example content, then connect a private content repository through GitHub Actions secrets.
