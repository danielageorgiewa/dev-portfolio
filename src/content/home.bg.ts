// Home page copy, Bulgarian. Word for word from Figma (Home · Desktop 1440 · BG, node 61:124).
// Do not rewrite, shorten or re-translate anything here; ask Daniela if something has to change.
// Strings marked "not in Figma" are functional UI or alt text pending Daniela's wording.
import type { HomeContent } from './home.en';

export const home: HomeContent = {
  meta: {
    // Not in Figma: composed from the hero name, kicker and tagline.
    title: 'Даниела Георгиева · Full stack DevOps инженер',
    description:
      'Амбициозни идеи, изградени от начало до край, от първата скица до нещо, което хората използват всеки ден.',
  },
  hero: {
    kicker: 'Full stack DevOps инженер · Пловдив, България · UTC+2',
    firstName: 'Даниела',
    lastName: 'Георгиева',
    tagline:
      'Амбициозни идеи, изградени от начало до край, от първата скица до нещо, което хората използват всеки ден.',
    start: 'Започнете проект',
    projects: 'Вижте трите проекта',
    cv: 'Вижте или свалете CV',
    meta: ['FULL STACK И DEVOPS', 'ПЛОВДИВ · UTC+2', 'СВОБОДНА ЗА ПРОЕКТИ'],
    scroll: 'СКРОЛ',
    // Not in Figma.
    portraitAlt: 'Портрет на Даниела Георгиева',
  },
  about: {
    eyebrow: 'За мен',
    lead: 'Придавам истински смисъл на „от начало до край“:',
    rest: 'от първия дизайн до сървърите, на които работи, аз изграждам всичко.',
    bio: [
      'Създавам бранд идентичности и изграждам сайтовете и системите зад тях, а работата ми вдига продажбите. Поддържам това, което правя, и в продукция: сама пускам релийзите и мигрирам живите данни.',
      'Хората бързо разбират, че не чакам да ме помолят. За четири месеца в XTRMND от навлизане в кода стигнах до собствени проекти и водя презентациите им пред собствениците, а отзивите са отлични. Системата за наличности, която поех, работеше в продукция още през втория ми месец. Работя еднакво добре в екип и сама, хората казват, че съм търпелива и мила с тях, а когато стане трудно, пак се усмихвам. Целта ми е да бъда най-добрата в тази област.',
      'Живея в Пловдив. Извън работа съм навън или играя видеоигри.',
    ],
    info: [
      { label: 'С какво се занимавам', value: 'Бранд идентичност, дизайн, разработка и поддръжка в продукция' },
      { label: 'Образование', value: 'Бакалавър по компютърни науки, Университет на Есекс' },
      { label: 'Езици', value: 'Български, английски (C2), френски (A2)' },
    ],
  },
  work: {
    // The whole heading is italic in the Bulgarian frame.
    titleItalic: 'Избрани проекти',
    titleRest: '',
    titleOrder: 'italic-first',
    count: '(03)',
    link: 'Прочетете казуса',
    footnote:
      '* Имената на клиентите са заместители, а логата им са скрити заради поверителност. Истинските при поискване.',
    cards: [
      {
        slug: 'multi-shop-platform',
        theme: 'sky',
        index: '01',
        client: 'Aperta* · Lightwell* и още осем магазина',
        kind: 'Платформа за онлайн магазини',
        title: 'Една платформа, девет магазина, луксозен вид.',
        body: 'Девет онлайн магазина, повечето на WordPress, често се чупеха, падаха и зареждаха бавно, а всеки изискваше отделни поправки по сигурността. Премествам ги на една бърза и сигурна платформа, с по-силна идентичност за всяка марка и по-удобно пазаруване. Вече всяка поправка се пуска веднъж и стига до всички магазини.',
        numbers: [{ value: '9 → 1', label: 'магазина на една платформа' }],
        chips: ['Medusa', 'Next.js', 'Payload', 'PostgreSQL'],
        // Not in Figma.
        shotAlt: 'Начална страница на новия онлайн магазин, логото на клиента е скрито',
      },
      {
        slug: 'language-school-website',
        theme: 'ea',
        index: '02',
        client: 'LingvoMost* · Езиково училище',
        kind: 'Уебсайт и CMS',
        title: 'Сайт на езиково училище',
        body: 'Училището беше надраснало сайта си и нямаше единен облик. Изградих му бранд идентичност, която вдъхва доверие и се запомня, а след това проектирах, разработих и хоствам новия сайт. Той зарежда бързо, а служителите сами редактират всяка страница.',
        numbers: [
          { value: '31 → 100', label: 'Оценка за скорост от Google, компютър' },
          { value: '54 → 95', label: 'Оценка за скорост от Google, телефон' },
        ],
        chips: ['Figma', 'Next.js', 'Payload', 'PostgreSQL', 'Docker'],
        // Not in Figma.
        shotAlt: 'Начална страница на новия сайт на езиковото училище, логото на клиента е скрито',
      },
      {
        slug: 'warehouse-management-system',
        theme: 'sis',
        index: '03',
        client: 'Aperta* · Производител на покривни прозорци',
        kind: 'Наличности и логистика на поръчки',
        title: 'Система за управление на склад',
        body: 'Фирмата продаваше през няколко сайта и търговски портал, а наличностите се водеха в една обща таблица. Поръчки се губеха, бройките не излизаха. Замених таблицата със система, свързана директно с всеки сайт. Сега всички канали ползват една и съща наличност и всяка промяна се записва. Работи в продукция от август 2026 г., а всеки релийз пускам аз.',
        numbers: [
          { value: '47 → 0', label: 'продажби, сваляли наличност от грешен продукт' },
          { value: '5', label: 'канала за продажба с една обща наличност' },
        ],
        chips: ['TypeScript', 'Node', 'PostgreSQL', 'Next.js', 'Docker'],
        // Not in Figma.
        shotAlt: 'Табло на системата за управление на склад с демо данни, логото на клиента е скрито',
      },
    ],
  },
  manifesto: {
    eyebrow: 'Как работя',
    word: 'Перфекционизъм',
    sizeLabel: '1322 × 185',
    offLabel: '0 px отклонение',
    lineBefore: 'Прецизност във ',
    lineAccent: 'всеки детайл',
    lineAfter: ', за всеки клиент.',
  },
  toolbox: {
    eyebrow: 'Инструменти',
    title: 'С какво работя',
    aside: 'Технологиите зад проектите по-горе.',
    marquee: [
      ['Figma', 'TypeScript', 'React', 'Next.js', 'Tailwind', 'Node', 'PostgreSQL', 'Payload'],
      ['Docker', 'Linux', 'GitHub Actions', 'Nginx', 'Medusa', 'Bash', 'Python', 'AWS', 'Kubernetes'],
    ],
    rows: [
      {
        label: 'Администриране на Linux',
        chips: [
          'LVM',
          'Файлови системи и монтиране',
          'Потребители и права',
          'Виртуализация (UTM)',
          'Настройка на Linux VPS',
          'Управление на ИТ инфраструктура',
          'Bash скриптове',
        ],
      },
      {
        label: 'Офанзивна сигурност',
        chips: [
          'OWASP Top 10',
          'MITRE ATT&CK',
          'Kali Linux',
          'Nmap',
          'gobuster',
          'sqlmap',
          'Metasploit',
          'netcat',
          'OSINT',
          'Shodan',
          'Google dorking',
          'WHOIS',
          'crt.sh',
          'Wayback Machine',
          'Уеб уязвимости',
          'Reverse shell и pivoting',
          'Ескалация на привилегии в Linux и Windows',
          'Active Directory',
          'BloodHound',
          'Kerberoasting',
          'Извличане на пароли и хешове',
          'C2 фреймуърци',
          'Cobalt Strike',
          'Tuoni',
        ],
      },
      {
        label: 'Дефанзивна сигурност',
        chips: [
          'Microsoft Sentinel и KQL',
          'Wazuh',
          'Анализ на логове за сигурност',
          'Сигурност на Windows и IIS',
          'tcpdump',
          'Защита на сървъри',
          'Защитни хедъри и CSP',
          'TLS и сертификати',
          'Управление на секрети',
          'Сканиране на зависимости',
        ],
      },
      {
        label: 'Мрежи',
        chips: [
          'Мрежова администрация и инфраструктура',
          'TCP/IP и OSI модел',
          'Подмрежи и CIDR',
          'Портове и защитни стени',
          'NAT и пренасочване на портове',
          'HTTP/HTTPS',
          'CDN и кеширане',
          'DNS и Cloudflare',
          'SSH ключове и тунели',
          'Cloudflare Tunnel',
          'Let’s Encrypt и ACME',
          'dig и nslookup',
          'curl и openssl',
          'ss, netstat и lsof',
        ],
      },
      {
        label: 'DevOps',
        chips: [
          'Docker и Compose',
          'CI/CD с GitHub Actions',
          'Turborepo и pnpm workspaces',
          'Nginx',
          'Python',
        ],
      },
      {
        label: 'Full stack',
        chips: [
          'TypeScript',
          'JavaScript',
          'React',
          'Next.js',
          'Tailwind CSS',
          'HTML и CSS',
          'Node.js',
          'Medusa',
          'Payload CMS',
          'PostgreSQL',
          'SQL',
          'REST APIs',
          'Webhooks',
        ],
      },
      {
        label: 'Начин на работа',
        chips: ['Лидерство', 'Комуникация със собственици', 'Агентни работни процеси', 'Git и ревю на код', 'Figma', 'Адаптивен дизайн', 'От дизайн към код'],
      },
      {
        label: 'Уча в момента',
        note: 'Програма Cloud & DevOps на EPAM',
        chips: ['AWS', 'Kubernetes'],
        dark: true,
      },
    ],
  },
  beyond: {
    titleBefore: 'Отвъд',
    titleItalic: 'кода',
    ctf: {
      eyebrow: 'Сигурност',
      prompt: '$ cat portfolio/flag.txt',
      hint: 'псст. в тази страница е скрит още един флаг.',
      title: 'CTF състезател',
      body: 'Играя CTF, за да държа уменията си по сигурност във форма. Бях сред победителите в кампанията Women in Cyber на TryHackMe.',
    },
  },
  contact: {
    status: 'Приемам нови проекти',
    headline: 'Разкажете ми какво',
    headlineItalic: 'изграждате.',
    intro:
      'Изберете час за безплатен 30-минутен разговор. Кажете ми какво ви трябва и ще ви кажа как бих го изградила.',
    book: 'Запазете този час',
    fallback: 'Няма удобен час? Пишете ми и ще намерим.',
    // Not in Figma.
    emailCta: 'Пишете ми',
    // Not in Figma.
    noSlots: 'Няма свободни часове тази седмица',
    links: { github: 'GitHub', linkedin: 'LinkedIn' },
    // TODO(copy): the booking form is described in the motion spec but not drawn in Figma.
    // These labels are functional UI strings pending Daniela's wording.
    form: {
      name: 'Име',
      email: 'Имейл',
      message: 'Какво изграждате?',
      submit: 'Запазете този час',
      cancel: 'Назад',
      sending: 'Запазване',
      success: 'Часът е запазен. Поканата е в пощата ви.',
      error: 'Не се получи. Пишете ми и ще намерим час.',
      taken: 'Този час току-що беше зает. Изберете друг.',
    },
  },
  footer: {
    left: '© Даниела Георгиева · Пловдив, България',
    right: 'Проектиран и изграден изцяло от мен',
  },
};
