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
    verify: {
      copy: 'Копирай',
      copied: 'Копирано',
      help: 'За да проверите копието си, пуснете shasum -a 256 на macOS, sha256sum на Linux или Get-FileHash в PowerShell. Резултатът трябва да съвпада с хеша отгоре.',
      older: 'По-стари версии:',
    },
  },
  name: 'Даниела Георгиева',
  title: 'Full Stack | DevOps | Бъдещ пентестър',
  location: 'Пловдив, България',
  links: { github: 'GitHub', linkedin: 'LinkedIn' },
  profile: {
    label: 'Профил',
    text: 'Ентусиаст съм в офанзивната сигурност с опит във Full Stack и DevOps: разбирам как се проектират и изграждат системите и тяхната инфраструктура и къде да търся слабости. Извън работа обичам да играя CTF, да изграждам домашни лаборатории на виртуални машини и да посещавам полезни уебинари и уъркшопи. Решена съм да се развивам и да стана една от най-добрите в бранша и съм изключително проактивна, за да го постигна. За четири месеца в XTRMND от навлизане в кода стигнах до собствени проекти в продукция.',
  },
  experience: {
    label: 'Опит',
    jobs: [
      {
        title: 'Full stack DevOps инженер',
        place: 'XTRMND · Пловдив',
        dates: 'юли 2026 – досега',
        bullets: [
          'Отговарях за проектирането, изграждането и поддръжката на складовата система на международен доставчик на покривни прозорци, която замени стара система от таблици/Apps Script. Multi-tenant архитектура, която взима наличностите си от няколко сайта на WooCommerce/Shopify и собствени сайтове. Грешните движения на наличности паднаха до 0.',
          'WMS системата работи на собствен (self-hosted) Linux сървър с CI/CD в GitHub Actions, което пуска релийзите на staging при merge и в продукция с ръчно задействане. Health checks, резервни копия и rollback с една стъпка, заложени в дизайна.',
          'Отговарях за създаването на търговско решение за B2B клиенти, свързано с API-то на складовата система. Системата издава фактури с ДДС и проформи и има конфигуриран SMTP сървър, който ги изпраща.',
          'Направих изцяло нов облик на сайта на езиково училище, като го проектирахме, изградихме, поддържаме и хостваме сами. Започнах с нова бранд идентичност във Figma, след което превърнах дизайна в код. Те имат собствена CMS (Payload), в която могат да редактират всичко, което пожелаят, и да преизползват компоненти от Figma, за да добавят нови обяви. Скоростта в Google се повиши от 31 на 100 (компютър) и от 54 на 95 (телефон).',
          'Прехвърлям девет стари сайта на WordPress и Shopify на една платформа, която проектирах и изградих. В обхвата са достъп по роли, IAM автентикация и разширяване към микросървиси.',
        ],
      },
    ],
  },
  skills: {
    label: 'Умения',
    groups: [
      {
        name: 'Администриране на Linux',
        items:
          'LVM, файлови системи и монтиране, потребители и права, виртуализация (UTM), настройка на VPS, управление на ИТ инфраструктура, Bash скриптове',
      },
      {
        name: 'Сигурност',
        items:
          'OWASP Top 10, MITRE ATT&CK, Kali Linux, Nmap, gobuster, sqlmap, Metasploit, netcat, OSINT (Shodan, Google dorking, WHOIS, crt.sh, Wayback Machine), уеб уязвимости, reverse shell и pivoting, ескалация на привилегии в Linux и Windows, Active Directory, BloodHound, Kerberoasting, извличане на пароли и хешове, C2 фреймуърци (Cobalt Strike, Tuoni), Microsoft Sentinel и KQL, Wazuh, анализ на логове за сигурност, сигурност на Windows и IIS, tcpdump, защита на сървъри, защитни хедъри и CSP, TLS и сертификати, управление на секрети, сканиране на зависимости',
      },
      {
        name: 'Мрежи',
        items:
          'Мрежова администрация и инфраструктура, TCP/IP и OSI, подмрежи и CIDR, портове и защитни стени, NAT и пренасочване на портове, HTTP/HTTPS, CDN и кеширане, DNS и Cloudflare, SSH ключове и тунели, Cloudflare Tunnel, Let’s Encrypt и ACME, dig, nslookup, curl, openssl, ss, netstat и lsof',
        itemsPrint:
          'Мрежова администрация и инфраструктура, TCP/IP и OSI, подмрежи и CIDR, защитни стени, NAT и пренасочване на портове, HTTP/HTTPS, CDN, DNS, Cloudflare и Cloudflare Tunnel, SSH ключове и тунели, Let’s Encrypt, dig, nslookup, curl, openssl, ss, netstat, lsof',
      },
      {
        name: 'DevOps',
        items:
          'Docker и Compose, GitHub Actions CI/CD, Turborepo и pnpm workspaces, Nginx, Python',
        itemsPrint:
          'Docker и Compose, GitHub Actions CI/CD, Turborepo и pnpm, Nginx, Python',
      },
      {
        name: 'Full stack',
        printOnly: true,
        items:
          'TypeScript, JavaScript, React, Next.js, Tailwind CSS, HTML и CSS, Node.js, Medusa, Payload CMS, PostgreSQL, SQL, REST API, webhooks',
      },
      {
        name: 'Фронтенд',
        screenOnly: true,
        items:
          'TypeScript, JavaScript, React, Next.js (фреймуърк), Tailwind CSS, HTML и CSS, адаптивен уеб дизайн',
      },
      {
        name: 'Бекенд и данни',
        screenOnly: true,
        items:
          'Node.js, Medusa (фреймуърк), Payload CMS, PostgreSQL, SQL, REST API, webhooks, API интеграции',
      },
      {
        name: 'Начин на работа',
        // Not in the A4 PDF (Daniela, Nov 2026): makes room for the longer Women4Cyber line.
        screenOnly: true,
        items: 'Лидерство, работа със заинтересовани страни, агентни работни процеси, Git и преглед на код, Figma, адаптивен дизайн, от дизайн към код',
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
    label: 'Доброволчество',
    items: [
      'Като активен член на българския клон на Women4Cyber редовно допринасям за кампаниите им. Поех създаването на материалите (уеб приложение във формат на презентация, хоствано в Cloudflare Pages) за занятията им по кибербезопасност в училищата и ръководих Пловдивския регион. Повече за мен можете да научите на сайта ми, чийто линк е най-отгоре.',
    ],
  },
};
