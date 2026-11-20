// Site header copy. `back` is word for word from the case study headers in Figma
// (54:38 EN, 91:77 BG). The home section links and the menu label are not drawn in Figma
// (the motion spec only says "name, links and these toggles"): functional UI strings
// pending Daniela's wording.
import type { Lang } from '../i18n';

export interface HeaderContent {
  back: string;
  sections: { label: string; hash: string }[];
  navLabel: string;
  menu: string;
}

export const header: Record<Lang, HeaderContent> = {
  en: {
    back: 'All work',
    sections: [
      { label: 'Work', hash: 'work' },
      { label: 'Toolbox', hash: 'toolbox' },
      { label: 'Contact', hash: 'contact' },
    ],
    navLabel: 'Main',
    menu: 'Menu',
  },
  bg: {
    back: 'Всички проекти',
    sections: [
      { label: 'Проекти', hash: 'work' },
      { label: 'Технологии', hash: 'toolbox' },
      { label: 'Контакт', hash: 'contact' },
    ],
    navLabel: 'Основна навигация',
    menu: 'Меню',
  },
};
