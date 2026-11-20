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
    text: 'Full stack DevOps инженер, който води продуктите от първия дизайн до продукция и ги поддържа там. Офанзивната сигурност е най-голямата ми страст и посоката на кариерата ми: извън работа практикувам всеки ден с CTF състезания, публични CVE и изучаване на уязвимости. Проактивна съм и уча бързо: за четири месеца в XTRMND от навлизане в кода стигнах дотам сама да водя проекти и презентациите им пред собствениците на разбираем език, а поетата от мен система за наличности беше в продукция още на втория месец. Работя добре и в екип, и сама, търпелива и ясна съм и спазвам сроковете. Целта ми е да бъда най-добрата в областта и гледам всяка задача от всички страни.',
  },
  experience: {
    label: 'Опит',
    jobs: [
      {
        title: 'Full stack DevOps инженер',
        place: 'XTRMND · Пловдив',
        dates: 'юли 2026 – досега',
        bullets: [
          'Поех складовата система на производител на покривни прозорци и изведох бизнеса от общата таблица. В продукция от август 2026 г.: пет канала за продажба ползват една наличност, а продажбите с наличност от грешен продукт паднаха от 47 на 0.',
          'Пускам релийзите и я поддържам на Linux сървър (Docker Compose, PostgreSQL с нощни копия, Caddy). GitHub Actions деплойва на staging, после в продукция, с health check и rollback с една стъпка. Шест релийза между 6 и 19 ноември 2026 г.',
          'B2B портал: клиентите поръчват онлайн и получават автоматично проформа, фактура и месечно извлечение, с наличност на живо от складовата система. Изградих връзката за наличностите и извлеченията, а на 22 октомври 2026 г. прехвърлих наличностите в продукция (копие, защитена SQL транзакция, план за връщане) без разминавания.',
          'Проектирах, изградих и хоствам сайта и бранд идентичността на езиково училище, с CMS, която екипът редактира сам. Скорост в Google: 31 → 100 на компютър, 54 → 95 на телефон.',
          'Премествам девет магазина на WordPress и Shopify на една платформа, която проектирах и изградих: поправка или нова цена се прави веднъж, а всеки размер има страница в Google.',
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
    // Newest first. Course titles stay in English.
    items: [
      {
        title: 'Inside a Cyber Attack: Student Bootcamp',
        place: 'Focal Point Academy · от пробив до кражба на данни, SIEM, детекции с KQL',
        dates: 'ноември 2026',
      },
      {
        title: 'Cloud Hacking & Cloud Defence',
        place: 'Focal Point Academy · атаки в облака на Microsoft и откриването им',
        dates: 'ноември 2026',
      },
      { title: 'Програма Cloud & DevOps', place: 'EPAM · Linux, Bash, Python, Docker, AWS, Kubernetes' },
    ],
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
      'Доброволец съм в 40-минутните занятия по киберсигурност на Women4Cyber България в училища в цялата страна. Сама поех управлението на проекта, отговарях за Пловдив и проектирах и изградих презентацията за 1. до 4. клас като уеб приложение, което се пуска в клас.',
    ],
  },
};
