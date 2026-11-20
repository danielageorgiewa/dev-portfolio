// CV copy, Bulgarian. Word for word from Figma (CV mode BG 95:26, A4 BG 89:26).
// This is Daniela's own translation, not a mirror of the English. Do not re-translate or
// "improve" it; ask Daniela if something has to change.
// After any change, regenerate the PDFs: npm run cv:pdf (see scripts/README-cv-pdfs.md).
import type { CvContent } from './cv';

export const cv: CvContent = {
  download: {
    note: 'Това е кратката версия на портфолиото. Същите факти, на една страница.',
    current: 'Изтегли PDF',
    other: 'PDF in English',
  },
  name: 'Даниела Георгиева',
  title: 'Full stack DevOps инженер',
  location: 'Пловдив, България',
  links: { github: 'GitHub', linkedin: 'LinkedIn' },
  profile: {
    label: 'Профил',
    text: 'Full stack DevOps инженер, който води продуктите от първия дизайн до продукция и ги поддържа там. Създавам бранд идентичности и изграждам сайтове, онлайн магазини и вътрешни системи, които вдигат продажбите на малки бизнеси. Проактивна съм и уча бързо: за четири месеца в XTRMND от навлизане в кода стигнах до собствени проекти и водя презентациите им пред собствениците на разбираем език, а системата за наличности, която поех, работеше в продукция още през втория ми месец. Работя еднакво добре в екип и сама, търпелива и ясна съм в общуването и спазвам сроковете. Целта ми е да бъда най-добрата в тази област и гледам всяка задача от всички страни.',
  },
  experience: {
    label: 'Опит',
    jobs: [
      {
        title: 'Full stack DevOps инженер',
        place: 'XTRMND · Пловдив',
        dates: 'юли 2026 – досега',
        bullets: [
          'Система за управление на склад за производител на покривни прозорци, в продукция от август 2026 г. Поех разработката и изведох бизнеса от общата таблица: пет канала за продажба ползват една наличност, а продажбите, сваляли наличност от грешен продукт, паднаха от 47 на 0.',
          'Пускам релийзите и поддържам системата сама: Linux сървър, Docker Compose, PostgreSQL с нощни резервни копия, Caddy и GitHub Actions с деплой на staging и продукция, health check и rollback с една стъпка. Между 6 и 19 ноември 2026 г. пуснах шест релийза.',
          'B2B портал за търговски клиенти, в продукция. На 22 октомври 2026 г. прехвърлих наличностите му към новата система с резервно копие, защитена SQL транзакция и план за връщане назад, без нито едно разминаване.',
          'Сайт и бранд идентичност на езиково училище, проектирани, разработени и хоствани от мен, с CMS, в която служителите редактират сами. Оценката за скорост от Google се вдигна от 31 на 100 на компютър и от 54 на 95 на телефон.',
          'Една платформа за девет магазина на WordPress и Shopify, така че всяка поправка или промяна на цена се прави веднъж, а всеки размер на продукт има своя страница в Google.',
        ],
      },
    ],
  },
  skills: {
    label: 'Умения',
    groups: [
      {
        name: 'Фронтенд',
        items: 'TypeScript, JavaScript, React, Next.js (фреймуърк), Tailwind CSS, HTML и CSS, адаптивен уеб дизайн',
      },
      {
        name: 'Бекенд и данни',
        items: 'Node.js, Medusa (фреймуърк), Payload CMS, PostgreSQL, SQL, REST API, webhooks, API интеграции',
      },
      {
        name: 'DevOps и Linux',
        items:
          'Релийзи и rollback в продукция, Docker и Compose, CI/CD с GitHub Actions, Turborepo и pnpm workspaces, настройка на Linux VPS, Nginx, Caddy, Bash скриптове, Python',
      },
      {
        name: 'Мрежи',
        items:
          'TCP/IP и OSI модел, подмрежи и CIDR, портове и защитни стени, NAT и пренасочване на портове, HTTP/HTTPS, CDN и кеширане, DNS и Cloudflare, SSH ключове и тунели, Cloudflare Tunnel, Let’s Encrypt и ACME, dig, nslookup, curl, openssl, ss, netstat и lsof',
      },
      {
        name: 'Сигурност',
        items:
          'OWASP Top 10, MITRE ATT&CK, защита на сървъри, защитни хедъри и CSP, TLS и сертификати, управление на секрети, сканиране на зависимости, SIEM, tcpdump, уеб уязвимости, ескалация на привилегии в Linux',
      },
      {
        name: 'Дизайн',
        items: 'Бранд идентичност, Figma, UI дизайн, UX, адаптивен дизайн, от дизайн към код',
      },
      {
        name: 'Тестване',
        items: 'Playwright, Vitest, Lighthouse CI, проверки за достъпност (axe)',
      },
      {
        name: 'Начин на работа',
        // Not in the A4 PDF (Daniela, Nov 2026): makes room for the longer Women4Cyber line.
        screenOnly: true,
        items: 'Лидерство, работа със заинтересовани страни, агентни работни процеси, Git и преглед на код',
      },
    ],
  },
  education: {
    label: 'Образование',
    items: [{ title: 'Бакалавър по компютърни науки', place: 'Университет на Есекс', dates: 'Завършване 2030' }],
  },
  training: {
    label: 'Обучение',
    items: [{ title: 'Програма Cloud & DevOps', place: 'EPAM · Linux, Bash, Python, Docker, AWS, Kubernetes' }],
  },
  educationAndTraining: { label: 'Образование и обучение' },
  languages: {
    label: 'Езици',
    text: 'Български (роден) · Английски (C2, Cambridge CPE) · Френски (A2)',
  },
  volunteering: {
    label: 'Сигурност и доброволчество',
    items: [
      'CTF състезател. Сред победителите в кампанията Women in Cyber на TryHackMe.',
      'Доброволец в Women4Cyber. За посещенията в училища в цялата страна, в които учим деца на киберсигурност, по своя инициатива поех управлението на проекта, бях регионален отговорник за Пловдив и проектирах и изградих презентацията като уеб приложение за 1. до 4. клас.',
    ],
  },
};
