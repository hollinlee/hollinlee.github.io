import { profile, siteMetadata } from './content';

const github = profile.links.github?.url ?? '';
const emailUrl = profile.links.email?.url ?? '';

export const site = {
  name: profile.name,
  handle: profile.handle,
  nickname: profile.name,
  avatar: profile.avatar,
  role: '',
  title: siteMetadata.title,
  description: siteMetadata.subtitle,
  url: import.meta.env.SITE || 'https://example.com',
  language: siteMetadata.language,
  locale: siteMetadata.language.replace('-', '_'),
  siteLaunchedAt: siteMetadata.siteLaunchedAt ?? '2026-07-17',
  email: emailUrl.startsWith('mailto:') ? emailUrl.slice('mailto:'.length) : '',
  github,
  hero: {
    eyebrow: '',
    title: siteMetadata.title,
    description: siteMetadata.subtitle,
  },
  focus: [] as string[],
} as const;
