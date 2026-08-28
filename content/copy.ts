/**
 * Site copy, English and Bulgarian.
 *
 * Lifted verbatim from the two design files — do not retype, reword or
 * regenerate either language. The Bulgarian is a real translation tuned by
 * ear, not a mirror of the English phrasing.
 *
 * The desktop and mobile designs ship slightly different dictionaries. This
 * is their union; all 35 shared keys are byte-identical between the two, so
 * merging is lossless.
 *
 * Desktop-only keys — used above the mobile breakpoint:
 *   navWork, navStack, navAbout, navBook, stat3, workCount, confirm, location
 *
 * Mobile-only keys — the shortened variants the phone layout needs:
 *   stat3short, workCountShort, confirmWith, inCal, footer, menu, emailLabel
 *
 * Notes on the pairs:
 *   stat3 / stat3short          full vs shortened hero meta item
 *   workCount / workCountShort  full vs shortened section count label
 *   confirm / confirmWith+inCal desktop uses one string; mobile splits it so
 *                               the pinned bar can style the two halves apart
 *   location / footer           desktop footer line vs mobile footer line
 *   menu                        present in the mobile design file but unused —
 *                               the phone nav was cut deliberately, no hamburger
 *   emailLabel                  mobile-only footer label
 */

export const copy = {
  en: {
    navWork: "Work",
    navStack: "Stack",
    navAbout: "About",
    navBook: "Book a call",
    portrait: "portrait",
    role: "Full stack developer · Plovdiv, Bulgaria · UTC+3",
    first: "Daniela",
    last: "Georgieva",
    bio: "Ambitious ideas, built end to end — from the first sketch to something people use every day.",
    book30: "Book a 30-minute call",
    seeWork: "See three projects",
    stat1: "Full stack",
    stat2: "Plovdiv · UTC+3",
    stat3: "Open to freelance work",
    scroll: "Scroll",
    aboutKicker: "About",
    aboutLead: "I'm here to deliver.",
    aboutBody: "A developer known for taking initiative and seeing things through. I always strive to build optimal, sustainable solutions crafted with care, producing software that is made to last. Clear to use, straightforward to maintain. Based in Plovdiv. Outside work, I'm either outdoors or playing video games.",
    eduKicker: "Education",
    langKicker: "Languages",
    languages: [
      {
        name: "Bulgarian",
        level: "Native"
      },
      {
        name: "English",
        level: "Native · C2, Cambridge CPE"
      },
      {
        name: "French",
        level: "A2, elementary"
      }
    ],
    education: [
      {
        title: "BSc Computer Science (Hons)",
        sub: "University of Essex · graduation expected 2030"
      }
    ],
    workTitleA: "Selected",
    workTitleB: "work",
    workCount: "Three recent projects",
    stackKicker: "Tech stack",
    stackTitle: "What I build with",
    stackNote: "The tools behind the projects above.",
    frontend: "Frontend",
    backend: "Backend & data",
    infra: "Tools",
    available: "Open to freelance and contract work",
    contactA: "Tell me what",
    contactB: "you're building.",
    contactSubA: "Pick a time below, and let's build ",
    contactSubEm: "your",
    contactSubB: " success story.",
    confirm: "Continue in Google Calendar",
    noSlot: "No time selected yet",
    selected: "Selected",
    location: "Plovdiv, Bulgaria · UTC+3",
    days: ["Wed", "Wed", "Thu", "Thu", "Fri", "Fri"],
    projects: [
      {
        name: "Multi-brand platform",
        year: "",
        note: "Brand names and product copy have been substituted here; this is not the live production site.",
        kind: "Retail, nine brands",
        slot: "product shot",
        tags: ["Medusa v2", "Next.js", "Node/TypeScript", "PostgreSQL"],
        what: "A consolidation of nine retail brands, trading across several countries and under separate companies, onto a single platform.",
        built: "A fragmented estate of WooCommerce and Shopify stores, each maintained independently, migrated onto one custom system built for long-term maintenance."
      },
      {
        name: "B2B trade portal",
        year: "",
        note: "Brand names and product copy have been substituted here; this is not the live production site.",
        kind: "Wholesale ordering",
        slot: "product shot",
        tags: ["Medusa v2", "Next.js 15", "PostgreSQL", "TypeScript"],
        what: "A private B2B trading platform covering the full path from account approval through to a settled order. Access is secured, with separate permission levels for each company and the staff within it.",
        built: "A migration away from a legacy WordPress stack, absorbing parts of the order process that had until then been handled outside any system."
      },
      {
        name: "OurMoney",
        year: "",
        kind: "Personal finance",
        slot: "product shot",
        tags: ["Kotlin", "Jetpack Compose", "Room", "PocketBase", "AI-assisted build"],
        what: "A finance application for couples, shaped by three demanding constraints: it runs on hardware its owners control, functions with no network connection, and takes transaction data directly from the bank.",
        built: "Designed and developed independently, spanning both the application and the infrastructure it runs on."
      }
    ],
    stat3short: "Open to freelance work",
    workCountShort: "Three recent",
    confirmWith: "Continue",
    inCal: "in Google Calendar",
    footer: "Plovdiv · UTC+3 · © 2026",
    menu: ["Work", "Tech stack", "About", "Education", "Contact"],
    emailLabel: "Email"
  },

  bg: {
    navWork: "Проекти",
    navStack: "Технологии",
    navAbout: "За мен",
    navBook: "Запази разговор",
    portrait: "снимка",
    role: "Софтуерен програмист · Пловдив, България · UTC+3",
    first: "Даниела",
    last: "Георгиева",
    bio: "Амбициозни идеи, изградени от начало до край — от първата скица до нещо, което хората използват всеки ден.",
    book30: "Запази 30-минутен разговор",
    seeWork: "Виж три проекта",
    stat1: "Full stack",
    stat2: "Пловдив · UTC+3",
    stat3: "Свободна за проекти",
    scroll: "Скрол",
    aboutKicker: "За мен",
    aboutLead: "Тук съм, за да доведа нещата до край.",
    aboutBody: "Софтуерен програмист, който се отличава с проактивност и целеустременост. Винаги се стремя към оптимални, устойчиви решения, изградени с внимание — софтуер, създаден да издържа. Лесен за използване, лесен за поддръжка. Живея в Пловдив. Извън работата можете да ме намерите в природата или в някоя видео игра.",
    eduKicker: "Образование",
    langKicker: "Езици",
    languages: [
      {
        name: "Български",
        level: "Роден"
      },
      {
        name: "Английски",
        level: "Роден · C2, Cambridge CPE"
      },
      {
        name: "Френски",
        level: "A2, начално ниво"
      }
    ],
    education: [
      {
        title: "Компютърни науки (с отличие)",
        sub: "University of Essex · очаквано завършване 2030"
      }
    ],
    workTitleA: "Избрани",
    workTitleB: "проекти",
    workCount: "Три скорошни проекта",
    stackKicker: "Технологии",
    stackTitle: "С какво работя",
    stackNote: "Инструментите зад проектите по-горе.",
    frontend: "Фронтенд",
    backend: "Бекенд и данни",
    infra: "Инструменти",
    available: "Свободна за свободни и договорни проекти",
    contactA: "Разкажете ми какво",
    contactB: "изграждате.",
    contactSubA: "Изберете час по-долу, за да изградим ",
    contactSubEm: "вашата",
    contactSubB: " успешна история.",
    confirm: "Продължете в Google Календар",
    noSlot: "Все още няма избран час",
    selected: "Избрано",
    location: "Пловдив, България · UTC+3",
    days: ["ср", "ср", "чт", "чт", "пт", "пт"],
    projects: [
      {
        name: "Мулти-бранд платформа",
        year: "",
        note: "Имената на марките и текстовете са заменени; това не е сайтът в реална експлоатация.",
        kind: "Търговия, девет марки",
        slot: "снимка на продукта",
        tags: ["Medusa v2", "Next.js", "Node/TypeScript", "PostgreSQL"],
        what: "Консолидация на девет търговски марки, работещи в няколко държави и под различни фирми, в една платформа.",
        built: "Разпръсната среда от WooCommerce и Shopify магазини, всеки поддържан самостоятелно, миграция към една custom система, изградена за дългосрочна поддръжка."
      },
      {
        name: "B2B търговски портал",
        year: "",
        note: "Имената на марките и текстовете са заменени; това не е сайтът в реална експлоатация.",
        kind: "Търговия на едро",
        slot: "снимка на продукта",
        tags: ["Medusa v2", "Next.js 15", "PostgreSQL", "TypeScript"],
        what: "Частна платформа за B2B търговия — покриваща целия път от одобрението на профил до приключена заявка. Достъпът е защитен, с отделни нива на права за всяка фирма и за нейните служители.",
        built: "Миграция от наследена WordPress система, поемаща части от процеса на заявка, които дотогава се извършваха извън каквато и да е система."
      },
      {
        name: "OurMoney",
        year: "",
        kind: "Лични финанси",
        slot: "снимка на продукта",
        tags: ["Kotlin", "Jetpack Compose", "Room", "PocketBase", "Разработено с AI"],
        what: "Приложение за лични финанси за двойки, оформено от три взискателни ограничения: работи на хардуер, контролиран от собствениците му, функционира без мрежова връзка и взема данните за транзакции директно от банката.",
        built: "Проектирано и разработено самостоятелно, обхващайки както приложението, така и инфраструктурата, на която работи."
      }
    ],
    stat3short: "Свободна за проекти",
    workCountShort: "Три скорошни",
    confirmWith: "Продължете",
    inCal: "в Google Календар",
    footer: "Пловдив · UTC+3 · © 2026",
    menu: ["Проекти", "Технологии", "За мен", "Образование", "Контакти"],
    emailLabel: "Имейл"
  }
} as const;

export type Lang = keyof typeof copy;

/**
 * The dictionary shape, with the literal types widened.
 *
 * `copy` is `as const`, so `copy.en.navWork` is the type `"Work"`, not
 * `string`. That is right for the data and wrong for anything that holds
 * *either* dictionary: `copy[lang]` would otherwise be a union of two
 * mutually-unassignable shapes, and `"Проекти"` is not a `"Work"`. Widening
 * once here gives every consumer one type it can hold.
 */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

export type Copy = Widen<(typeof copy)['en']>;
