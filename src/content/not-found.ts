// 404 copy. Not drawn in Figma: wording pending Daniela's approval.
import type { Lang } from '../i18n';

export const notFound: Record<Lang, { title: string; eyebrow: string; heading: string; body: string; back: string }> = {
  en: {
    title: 'Page not found · Daniela Georgieva',
    eyebrow: '404',
    heading: 'This page <em>doesn’t exist.</em>',
    body: 'The link may be old or mistyped.',
    back: 'Back to the portfolio',
  },
  bg: {
    title: 'Страницата не е намерена · Даниела Георгиева',
    eyebrow: '404',
    heading: 'Тази страница <em>не съществува.</em>',
    body: 'Връзката може да е стара или сгрешена.',
    back: 'Към портфолиото',
  },
};
