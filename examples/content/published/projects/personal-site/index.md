---
title: "可 Fork 的个人主页"
summary: "一个 Astro 个人主页模板，可以安全地从 Private content repository 中拉取公开 Markdown 内容。"
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

## 问题

个人网站经常把页面代码、草稿和已经发布的文章混在同一个 repository 中。

## 方案

这个模板让网站代码保持公开、可复用，同时在构建时只从可选的 Private content repository 中导入 `published/`。

## 结果

Fork 后可以直接使用示例内容部署，也可以通过 GitHub Actions Secret 连接自己的 Private content repository。
