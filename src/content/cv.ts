// CV copy model. One object feeds the web CV, the phone CV and the A4 PDF (print styles),
// so the three can never drift apart. Text is word for word from Figma:
// web EN 51:10, web BG 95:26, phone 83:56, A4 EN 51:106, A4 BG 89:26.
import type { Lang } from '../i18n';
import { cv as en } from './cv.en';
import { cv as bg } from './cv.bg';

/** A job, a degree or a course: serif title, a muted line under it, dates on the right. */
export interface CvEntry {
  title: string;
  place: string;
  /** Left out where Figma shows none (EPAM). */
  dates?: string;
}

export interface CvContent {
  /** Top of the page, above the sheet. Not part of the PDF. */
  download: {
    note: string;
    /** PDF in the page language. */
    current: string;
    /** PDF in the other language, labelled in that language. */
    other: string;
  };
  name: string;
  /** Title line under the name. Also the role of the current job. */
  title: string;
  location: string;
  /** Link labels in the contact line. The email and the site address come from src/i18n.ts. */
  links: { github: string; linkedin: string };
  profile: { label: string; text: string };
  experience: {
    label: string;
    jobs: (CvEntry & { bullets: string[] })[];
  };
  skills: {
    label: string;
    /** Web: name in its own column. A4: name inline in bold, followed by a colon. */
    /** `screenOnly` groups are left out of the A4 PDF so it stays on one page. */
    groups: { name: string; items: string; screenOnly?: boolean }[];
  };
  education: { label: string; items: CvEntry[] };
  training: { label: string; items: CvEntry[] };
  /** A4 only: Education and Training share one section under this label. */
  educationAndTraining: { label: string };
  languages: { label: string; text: string };
  volunteering: { label: string; items: string[] };
}

const byLang: Record<Lang, CvContent> = { en, bg };
export const getCv = (lang: Lang): CvContent => byLang[lang];

/** First sentence of the profile, used as the page description. */
export const cvLead = (t: CvContent): string => {
  const end = t.profile.text.indexOf('. ');
  return end === -1 ? t.profile.text : t.profile.text.slice(0, end + 1);
};
