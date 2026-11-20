// Case study · Language school website, Bulgarian. Word for word from Figma (91:229).
// A real translation, not a mirror of the English: never regenerate or re-translate it.
// Strings marked "Not in Figma" are functional (alt text, accessible names).
import type { CaseContent } from '../case';

export const school: CaseContent = {
  slug: 'language-school-website',
  author: 'Даниела Георгиева',
  intro: {
    // Same string as the multi-shop study (Figma header 91:232).
    back: 'Всички проекти',
    kicker: 'Казус · 02',
    title: 'Сайт на <em>езиково училище</em>',
    lead: 'Утвърдено езиково училище имаше сайт и облик, които не отговаряха на нивото му. Изградих бранд идентичността на училището, после проектирах, разработих и хоствам новия му сайт.',
    // Figma breaks the first line before "отговаряха"; in the browser the word fits 760px by 1px.
    leadWidth: 758,
    facts: [
      { key: 'Клиент', value: 'LingvoMost* · Езиково училище' },
      { key: 'Какво направих', value: 'Бранд идентичност, дизайн, разработка и хостинг' },
      { key: 'Резултат', value: 'Сайт и редактор на съдържание' },
      { key: 'Технологии', chips: ['Figma', 'Next.js', 'Payload', 'PostgreSQL', 'Docker'] },
    ],
  },
  screens: {
    // Figma draws two tabs, КОМПЮТЪР and ТЕЛЕФОН; only the desktop pair of screenshots exists.
    // See the note in the English file. The second tab would be { id: 'phone', label: 'ТЕЛЕФОН' }.
    tabs: [{ id: 'desktop', label: 'КОМПЮТЪР' }],
    caption: 'Двата сайта са заснети в една и съща седмица, старият вляво, новият вдясно. Снимките са примерни.',
    compare: {
      before: 'ПРЕДИ',
      after: 'СЛЕД',
      // Not in Figma: the slider's accessible name and its spoken value ({n} is 0 to 100).
      handle: 'Преди и след: каква част от стария сайт се вижда',
      valueText: '{n}% стар сайт, {m}% нов сайт',
    },
    // Not in Figma.
    tablistLabel: 'Екрани',
    alt: {
      before: 'Начална страница на стария сайт на училището, логото на клиента е скрито',
      after: 'Начална страница на новия сайт на училището, логото на клиента е скрито',
    },
    openLabel: 'Отвори екрана в пълен размер',
  },
  started: {
    kicker: 'Откъде започнахме',
    heading: 'Добро училище с бавен, остарял сайт.',
    text: 'Училището растеше повече от двадесет години, а сайтът изоставаше. На телефон страниците бяха бавни и трудни за четене, а курс се търсеше твърде дълго.',
    foundKicker: 'Какво измерих на стария сайт',
    rows: [
      { value: '31 / 100', label: 'Оценка за скорост от Google на компютър. 54 на телефон.' },
      { value: '33 с', label: 'докато се покаже основната снимка при бавна мобилна връзка' },
      { value: '228', label: 'сериозни проблема с достъпността на пет ключови страници' },
      { value: '80 от 120', label: 'страници без основно заглавие за търсачките' },
      { value: 'F', label: 'оценка за сигурност на настройките на сайта' },
      { value: 'Нямаше', label: 'съгласие за бисквитки, а проследяването вече работеше' },
    ],
  },
  changes: {
    kicker: 'Какво се промени',
    heading: 'Какво се промени <em>за училището.</em>',
    cards: [
      {
        number: '01',
        title: 'Бранд, утвърден колкото самото училище',
        text: 'Изградих ясна идентичност от материалите на училището и я приложих на всяка страница.',
        vignette: {
          kind: 'brand-kit',
          labels: { type: 'Aa', primary: 'Запиши се', secondary: 'Курсове' },
        },
      },
      {
        number: '02',
        title: 'Запитванията стигат до правилния офис',
        text: 'Формата в три стъпки приема въпроси за курсове и поръчки за преводи с файлове и праща всяко запитване до офиса, който го поема.',
        vignette: {
          kind: 'enquiry',
          labels: {
            step1: 'Тема',
            step2: 'Детайли',
            step3: 'Изпрати',
            step3Number: '3',
            toast: 'Изпратено до офиса на училището',
            toastNote: 'с 2 прикачени файла',
          },
        },
      },
      {
        number: '03',
        title: 'Курсовете се намират бързо',
        text: 'Посетителите филтрират по език, възраст и ниво и се записват направо от страницата на курса.',
        vignette: {
          kind: 'course-finder',
          labels: {
            chip1: 'Английски',
            chip2: 'Възрастни',
            chip3: 'B1',
            chip4: 'Онлайн',
            result1: 'Английски B1 · Възрастни',
            result2: 'Английски B2 · Възрастни',
            enrol: 'Запиши се',
          },
        },
      },
      {
        number: '04',
        title: 'Началната страница се зарежда за 2,9 секунди на телефон',
        text: 'При бавна връзка старият сайт показваше основното съдържание след 33 секунди.',
        vignette: {
          kind: 'speed',
          labels: {
            title: 'Основно съдържание на екрана · телефон',
            old: 'Стар сайт',
            oldValue: '33,0 с',
            new: 'Нов сайт',
            newValue: '2,9 с',
          },
        },
      },
    ],
  },
  editor: {
    kicker: 'Редакторът',
    heading: 'Служителите сами управляват сайта.',
    text: 'Курсове, цени, дати и новини се редактират в Payload, CMS, който настроих на български. Прегледът на живо показва страницата, докато пишат, така че нищо не излиза, преди да изглежда както трябва.',
    // Not in Figma.
    alt: 'Редакторът на съдържание с отворен курс: формата вляво, прегледът на живо на страницата вдясно. Логото на клиента е скрито.',
    openLabel: 'Отвори екрана в пълен размер',
  },
  results: {
    kicker: 'Резултати',
    heading: 'По-бърз и по-удобен.',
    numbers: [
      { value: '31 → 100', label: 'Оценка за скорост от Google, компютър' },
      { value: '54 → 95', label: 'Оценка за скорост от Google, телефон' },
      { value: '85 → 100', label: 'Оценка за достъпност, телефон' },
    ],
    metrics: [
      { label: 'Производителност, телефон', value: '54 → 95' },
      { label: 'Производителност, компютър', value: '31 → 100' },
      { label: 'Достъпност, телефон', value: '85 → 100' },
      { label: 'Достъпност, компютър', value: '83 → 100' },
      { label: 'Largest Contentful Paint, телефон', value: '33,0 с → 2,9 с' },
      { label: 'Largest Contentful Paint, компютър', value: '5,6 с → 0,7 с' },
      { label: 'Total Blocking Time, компютър', value: '520 мс → 0 мс' },
      { label: 'Cumulative Layout Shift, компютър', value: '0,268 → 0' },
    ],
    // The band colour in Figma is project/ea.
    tone: 'project-ea',
    method:
      'Лабораторни оценки от Lighthouse за началната страница. Стар сайт: на живо, през PageSpeed Insights. Нов сайт: продукционна версия преди пускане, медиана от три измервания.',
  },
  built: {
    kicker: 'Как е изградено',
    heading: 'Отговарях за всеки слой.',
    steps: [
      { number: '01', title: 'Дизайн', text: 'Figma, с дизайн система, която кодът преизползва' },
      { number: '02', title: 'Сайт', text: 'Next.js, бързи страници, подготвени предварително' },
      { number: '03', title: 'Редактор', text: 'Payload CMS, на български, с преглед на живо' },
      { number: '04', title: 'Данни', text: 'PostgreSQL, с резервно копие всяка нощ' },
      { number: '05', title: 'Сървър', text: 'Docker на частен сървър, с автоматичен деплой' },
    ],
  },
  next: {
    kicker: 'Следващ казус',
    title: 'Система за управление на склад',
  },
  footer: {
    left: '© Даниела Георгиева',
    right: '* Имената на клиентите са заместители, а логата им са скрити заради поверителност. Истинските при поискване.',
  },
};
