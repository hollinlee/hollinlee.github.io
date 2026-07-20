import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const commonArticle = {
  title: z.string(),
  description: z.string(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  lang: z.enum(['zh-CN', 'en']).default('zh-CN'),
};

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) => z.object({
    ...commonArticle,
    cover: image().optional(),
    featured: z.boolean().default(false),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object(commonArticle),
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

const logs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/logs' }),
  schema: z.object({
    title: z.string(),
    week: z.string(),
    publishedAt: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
  }),
});

export const collections = { posts, notes, projects, logs, pages };
