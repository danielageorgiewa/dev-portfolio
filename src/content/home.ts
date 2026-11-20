import type { Lang } from '../i18n';
import { home as en, type HomeContent } from './home.en';
import { home as bg } from './home.bg';

export type { HomeContent, ProjectCard } from './home.en';

const byLang: Record<Lang, HomeContent> = { en, bg };
export const getHome = (lang: Lang): HomeContent => byLang[lang];
