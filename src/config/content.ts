import backgroundsData from '../content-data/backgrounds.json';
import profileData from '../content-data/profile.json';
import projectStateData from '../content-data/project-state.json';
import siteData from '../content-data/site.json';

export type ProfileLink = {
  label: string;
  url: string;
};

export type ProfileData = {
  name: string;
  handle: string;
  avatar: string;
  links: Record<string, ProfileLink>;
};

export type BackgroundEntry = {
  image: string;
  textPosition: 'left' | 'right' | 'center';
  backgroundPosition: string;
};

export type BackgroundData = {
  rotationInterval: number;
  transitionDuration: number;
  blur: number;
  day: BackgroundEntry[];
  night: BackgroundEntry[];
};

export type SiteData = {
  title: string;
  subtitle: string;
  language: string;
  emptyStates?: {
    articlesTitle: string;
    articlesDescription: string;
  };
};

export type ProjectStateData = {
  emptyTitle: string;
  emptyDescription: string;
};

export const profile = profileData as ProfileData;
export const backgrounds = backgroundsData as BackgroundData;
export const siteMetadata = siteData as SiteData;
export const projectState = projectStateData as ProjectStateData;
