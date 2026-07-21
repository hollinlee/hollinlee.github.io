import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const commonArticle = {
  title: z.string(),
  description: z.string(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  lang: z.enum(['zh-CN', 'en']).default('zh-CN'),
  comments: z.boolean().default(true),
};

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    ...commonArticle,
    category: z.string().min(1),
    cover: z.string().regex(/^\/content-assets\/article-covers\/[^/]+\.webp$/).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    summary: z.string(),
    cover: image().optional(),
    status: z.enum(['active', 'experimental', 'maintained', 'archived']),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    repo: z.string().url().optional().or(z.literal('')),
    demo: z.string().url().optional().or(z.literal('')),
    startedAt: z.coerce.date().optional(),
    stack: z.array(z.string()).default([]),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
  }),
});

export const collections = { articles, projects, pages };
