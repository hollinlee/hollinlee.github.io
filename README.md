# Forkable Astro Personal Homepage

一个可 Fork 的 Astro 个人主页与博客主题。支持日夜背景、文章、笔记、项目、时间轴归档和 GitHub Pages，并可以从独立的 Private content repository 导入明确发布的内容。

## 特性

- Astro 7 + TypeScript
- Fuwari 式场景 Hero、个人资料卡和大图文章布局
- 日间樱花与夜间霓虹主题
- 自动轮换背景、樱花和夜间光点
- `prefers-reduced-motion` 与 `prefers-reduced-transparency`
- 项目精选、Tag 单选和时间轴归档
- 无 Private content repo 时使用匿名 example
- GitHub Pages 自动部署
- Public theme 与个人内容完全分离

## 快速开始

环境要求：Node.js 22 或更新版本。

```bash
npm ci
npm run dev
```

默认使用：

```text
examples/content/
```

常用命令：

```bash
npm run check
npm run build
npm run preview
```

## 内容仓库结构

建议创建一个独立的 Private repository：

```text
data/
├── profile.yml
├── site.yml
├── backgrounds.yml
├── project-state.yml
└── links.yml

published/
├── assets/
│   ├── avatar.webp
│   ├── backgrounds/
│   │   ├── day/
│   │   └── night/
│   ├── article-covers/
│   └── project-covers/
├── pages/
│   └── about.md
├── posts/
├── notes/
├── projects/
└── logs/

drafts/
private/
templates/
```

构建脚本采用目录白名单，只导入：

```text
published/
data/
```

以下目录永远不会被网站读取：

```text
drafts/
private/
templates/
```

## 个人资料配置

```yaml
# data/profile.yml
name: "Your Name"
handle: "your-handle"
avatar: "/content-assets/avatar.webp"
links:
  github:
    label: "GitHub"
    url: "https://github.com/your-name"
  email:
    label: "Email"
    url: "mailto:hello@example.com"
```

Profile schema 只允许 `name`、`handle`、`avatar`、GitHub 和 Email。`avatar` 同时用于导航、资料卡和浏览器标签页 favicon。主题不会根据 repository、文章或聊天记录推断个人资料。

## 站点配置

```yaml
# data/site.yml
title: "Your Name の 小站"
subtitle: "欢迎来到我的个人主页"
language: "zh-CN"
emptyStates:
  articlesTitle: "暂无公开文章"
  articlesDescription: "发布第一篇文章后，它会出现在这里。"
```

## 背景配置

背景文件放在 `published/assets/backgrounds/`，只提交优化后的 WebP。推荐最大尺寸 `2560×1440`，单张约 `200–600KB`。

```yaml
# data/backgrounds.yml
rotationInterval: 20000
transitionDuration: 2000
blur: 5

items:
  - image: "/content-assets/backgrounds/day/day-01.webp"
    textPosition: "left"
    backgroundPosition: "60% 45%"
  - image: "/content-assets/backgrounds/night/night-01.webp"
    textPosition: "left"
    backgroundPosition: "65% 50%"
```

所有图片属于同一个自动轮换池，不再按日间或夜间模式分类。`textPosition` 支持 `left`、`right`、`center`；`backgroundPosition` 使用标准 CSS background position。旧版 `day` / `night` 配置仍可在迁移期间构建，但会输出弃用提示。

## 文章与项目

文章可以使用相对路径封面：

```yaml
---
title: "文章标题"
description: "文章摘要"
publishedAt: 2026-07-18
cover: ./cover.webp
featured: true
tags: [Astro]
---
```

没有独立封面的文章使用纯文字卡片，不会复用背景图或全局默认封面。需要大图时，在文章目录中提供独立图片并通过 `cover` 显式引用。

项目通过 `data/project-state.yml` 显式控制是否公开：

```yaml
enabled: false
emptyTitle: "项目整理中"
emptyDescription: ""
```

只有设置 `enabled: true` 后，项目列表和详情路由才会生成。

## 连接 Private content repository

本地开发使用 `.env.local`：

```bash
CONTENT_REPO_URL=git@github.com:your-name/my-blog-content.git
CONTENT_REPO_BRANCH=main
```

可以从 `.env.example` 开始配置。`.env.local` 已被 Git 忽略。

### GitHub Actions deploy key

1. 生成一对专用 SSH key。
2. 将 public key 添加到 Private content repo 的 Deploy keys，只授予 read access。
3. 在网站 repo 的 Actions secrets 中添加 `CONTENT_DEPLOY_KEY`，内容为 private key。
4. 在网站 repo 的 Actions variables 中添加：

```text
CONTENT_REPO_URL
git@github.com:your-name/my-blog-content.git

CONTENT_REPO_BRANCH
main
```

也可以使用 HTTPS URL 和只读 `CONTENT_REPO_TOKEN`，但优先使用专用 read-only deploy key。

## Fork 与 GitHub Pages 部署

1. Fork 本 repository。
2. 将 fork 重命名为 `<username>.github.io`。
3. 在 Settings → Pages 中选择 **GitHub Actions**。
4. 修改 `examples/content/`，或连接 Private content repo。
5. Push 到 `main` 或手动运行 `Deploy website` workflow。

`astro.config.mjs` 会在 GitHub Actions 中根据 `GITHUB_REPOSITORY` 推导 Pages URL。本地或自定义域名可以设置：

```bash
SITE_URL=https://example.com
```

## Workflows

- `check.yml`：Pull Request 上使用匿名 example 执行 `npm ci`、type check 和 build。
- `deploy.yml`：Push 到 `main`、手动触发、content dispatch 或定时任务时部署 GitHub Pages。

Private content repo 可以通过 `repository_dispatch` 通知网站重新构建。如果不配置 dispatch token，网站仍会通过手动构建和定时任务更新。

## 隐私边界

- Theme repo 不保存站点所有者的姓名、邮箱、Avatar 或背景原图。
- 个人信息和个人媒体只保存在 content repo 的 `data/` 与 `published/`。
- 同步前会删除旧内容、旧 assets、Astro cache 和旧构建产物。
- 配置缺少必需字段、包含未批准字段或引用不存在的 asset 时，构建会失败。
- 不要把 token、密码、私人对话或机密文件放入 `published/` 或 `data/`。

## 字体与 License

主题 self-host：

- LXGW WenKai Screen
- Noto Sans SC
- Caveat

字体 license 位于 `public/fonts/LICENSES/`。项目代码使用 MIT License。
