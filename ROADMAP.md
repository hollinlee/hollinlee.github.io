# Site Roadmap

本文记录从其他优秀个人站提炼、但尚未在本站完整实现的增量能力。状态统一使用 `Backlog`、`Ready`、`In Progress`、`Done`、`Dropped`。

## 待实现计划

| ID | 优先级 | 状态 | 能力 | 实现范围 | 验收标准 |
| --- | --- | --- | --- | --- | --- |
| SITE-01 | P0 | Backlog | Pagefind 全文搜索 | 构建静态全文索引；搜索标题、摘要、正文和代码；保留现有 category/tag/关键词组合筛选 | 桌面和移动端均可搜索正文术语；无后端；键盘可操作；无结果状态明确 |
| SITE-02 | P0 | Backlog | 长文目录与阅读进度 | 桌面 sticky TOC；移动端可展开 TOC；当前章节高亮；页面顶部阅读进度 | H2/H3 自动生成目录；锚点可复制和直接访问；滚动时无明显抖动；支持 reduced motion |
| SITE-03 | P0 | Backlog | 代码块增强 | 增加复制按钮、语言/可选文件名、长行滚动、明暗主题适配 | Copy 成功有可访问反馈；移动端不产生页面级横向 overflow；无 JS 时代码仍可读 |
| SITE-04 | P0 | Backlog | 文章连续阅读 | 正文后增加上一篇、下一篇和相关文章 | 前后导航按发布时间稳定排序；相关文章优先相同 category，再按 tag 重叠数排序；排除当前文章 |
| SITE-05 | P0 | Backlog | 文章 SEO 完整化 | 在现有 canonical、OG 和 Twitter Card 基础上补 `BlogPosting` JSON-LD、文章 `og:image`、RSS、sitemap | 文章结构化数据包含 title、description、author、datePublished、dateModified（存在时）、URL 和 image（存在时）；RSS/sitemap 只包含公开内容 |
| SITE-06 | P1 | Backlog | Responsive images | Cover 和正文图片生成多尺寸 WebP/AVIF；使用 `srcset`、`sizes`、lazy loading；评估 LQIP 和灯箱 | 320/390/768/1440px 不下载明显过大的图片；图片加载不造成明显 layout shift；灯箱可键盘关闭 |
| SITE-07 | P1 | Backlog | 分类与标签总览 | 在现有 archive 组合筛选之上增加 category/tag 总览；常用 category 可作为横向快捷入口 | 每个条目显示文章数并链接到带 URL 状态的 archive；移动端可横向滚动且有 overflow 提示 |
| SITE-08 | P1 | Backlog | 标准文章收尾 | 统一参考资料、许可协议、复制永久链接、连续阅读、相关文章和评论的顺序 | 可从站点配置设置默认许可协议；文章可覆盖；没有参考资料或推荐内容时不渲染空区块 |
| SITE-09 | P1 | Backlog | 内容定位表达 | 在首页支持一条稳定的内容领域描述，与个性化 subtitle 分离 | 首屏能明确表达长期写作领域；文案来自 content config，不硬编码在组件中 |
| SITE-10 | P1 | Backlog | 系列文章 | 增加可选 `series`、`seriesOrder`；文章页展示系列进度；归档支持系列入口 | 不新增 content collection；同系列排序稳定；字段缺失时现有文章行为不变 |
| SITE-11 | P2 | Backlog | 随机文章发现 | 在相关文章之外提供少量随机文章，优先用于内容探索 | 至少有 10 篇公开文章后启用；排除当前文章和已展示的相关文章；不影响无 JS 阅读 |
| SITE-12 | P2 | Backlog | 分享能力 | 第一阶段复制链接；第二阶段按标题、摘要、作者、封面和 URL 生成分享海报 | 复制链接在 HTTPS 和 localhost 可用；海报内容不溢出；无 cover 时有稳定的 text-only 布局 |
| SITE-13 | P2 | Backlog | 文章列表视图切换 | Archive 或首页文章列表支持 list/grid，记住本地偏好 | 至少有 10 篇公开文章后启用；两种布局都支持无 cover；切换不改变筛选条件或 URL 状态 |
| SITE-14 | P1 | Backlog | 内容元数据治理 | 在 private content workflow 中规范 category/tag vocabulary 和大小写，避免同义或大小写重复 | `drafts:prepare` 能报告或修复已知 alias；例如不同时出现 `Cloudflare/CLoudflare`、`PHP/php`；失败不改写源文件 |

## 实施顺序

1. 搜索与阅读：`SITE-01`、`SITE-02`、`SITE-03`。
2. 内容关联与 SEO：`SITE-04`、`SITE-05`。
3. 图片、分类和文章收尾：`SITE-06`、`SITE-07`、`SITE-08`。
4. 内容体系：`SITE-09`、`SITE-10`、`SITE-14`。
5. 内容规模达到条件后：`SITE-11`、`SITE-12`、`SITE-13`。

## 明确非目标

| 能力 | 状态 | 原因 |
| --- | --- | --- |
| 文章过期提醒 | Dropped | 当前不需要；不增加 `reviewedAt`、`staleAfterDays` 或自动过期提示 |
| 背景音乐、歌词和歌单 | Dropped | 增加前端负担和第三方 API 依赖，与当前阅读优先的站点定位不符 |
| 为功能数量增加留言、追番、番组或相册页面 | Dropped | 仅在有持续内容来源和明确用户需求时单独评估 |
| 立即引入 embedding 语义推荐 | Dropped | 先使用 category/tag 的确定性推荐；文章规模足够后再评估 |

## 参考

- [Halfcity's Blog](https://blog.halfcity.top/)
- [Halfcity archive](https://blog.halfcity.top/archive/)
- [Halfcity article example](https://blog.halfcity.top/posts/research/driver/hypervisor/event/)
- [astro-koharu](https://github.com/cosZone/astro-koharu)
