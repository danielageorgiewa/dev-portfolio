// Case study · Multi-shop platform, Bulgarian. Word for word from Figma (91:76).
// A real translation, not a mirror of the English: never regenerate or re-translate it.
// Strings marked "Not in Figma" are functional (alt text, accessible names, input labels).
import type { CaseContent } from '../case';

export const multiShop: CaseContent = {
  slug: 'multi-shop-platform',
  author: 'Даниела Георгиева',
  intro: {
    back: 'Всички проекти',
    kicker: 'Казус · 01',
    title: 'Една платформа, девет магазина, <em>луксозен вид.</em>',
    lead: 'Производител на покривни прозорци има девет онлайн магазина за няколко марки и държави: седем на WordPress и WooCommerce и два на Shopify, всеки поддържан отделно. Премествам и деветте на една платформа, като започвам от основния магазин, и изграждам ясна идентичност за всяка марка.',
    facts: [
      { key: 'Клиент', value: 'Aperta* · Lightwell* и още осем магазина' },
      { key: 'Какво направих', value: 'Бранд идентичност, дизайн, разработка и внедряване' },
      { key: 'Резултат', value: 'Една платформа за всички магазини' },
      { key: 'Технологии', chips: ['Medusa', 'Next.js', 'Payload', 'PostgreSQL', 'Docker'] },
    ],
  },
  screens: {
    // Figma draws three tabs: НАЧАЛНА СТРАНИЦА, ПРОДУКТ, РАЗМЕР ПО ПОРЪЧКА. Only the Homepage
    // screen is drawn (91:110), so there is no redacted Product composite to export yet. When it
    // exists, add { id: 'product', label: 'ПРОДУКТ' } here and its alt below.
    tabs: [
      { id: 'homepage', label: 'НАЧАЛНА СТРАНИЦА' },
      { id: 'custom-size', label: 'РАЗМЕР ПО ПОРЪЧКА' },
    ],
    caption: 'Показано с разрешение на клиента.',
    // Not in Figma.
    tablistLabel: 'Екрани',
    alt: {
      homepage: 'Начална страница на новия онлайн магазин, логото на клиента е скрито',
    },
    openLabel: 'Отвори екрана в пълен размер',
  },
  started: {
    kicker: 'Откъде започнахме',
    heading: 'Всяка промяна трябваше да се прави девет пъти.',
    text: 'Всеки магазин имаше собствена инсталация на WordPress или Shopify, свои плъгини и свое копие на едни и същи продукти. Сайтовете се чупеха, падаха и зареждаха бавно, а всеки изискваше отделни поправки по сигурността. Цени, правни текстове и бъгове се оправяха магазин по магазин.',
    foundKicker: 'Какво открих в магазините',
    rows: [
      { value: '9', label: 'магазина на две различни платформи' },
      {
        value: '7 до 9 ×',
        label: 'една и съща поправка, правен текст или промяна в проследяването, веднъж за всеки магазин',
      },
      { value: '~600', label: 'продукта, най-вече едни и същи няколко модела в различни размери' },
      { value: 'На ръка', label: 'ценообразуване за размери по поръчка' },
    ],
  },
  changes: {
    kicker: 'Какво се промени',
    heading: 'Какво се променя за <em>бизнеса.</em>',
    cards: [
      {
        number: '01',
        title: 'Промените се правят веднъж, не девет пъти',
        text: 'И деветте магазина работят на една кодова база с един админ панел, независимо от марката и държавата.',
        vignette: {
          kind: 'fan-out',
          labels: { fix: 'fix: ДДС във фактурите', shop: 'Магазин' },
        },
      },
      {
        number: '02',
        title: 'Всеки размер може да се класира в Google',
        text: 'Всеки размер има своя страница, така че който търси 1000 × 2000, попада точно на нея, с цена и наличност.',
        vignette: {
          kind: 'size-rows',
          labels: {
            url: '/flat-roof-window/1000x2000',
            size1: '800 × 800 mm',
            pill1: 'Наличен',
            size2: '1000 × 2000 mm',
            pill2: 'Остават 2',
            size3: '1200 × 1200 mm',
            pill3: 'По поръчка',
          },
        },
      },
      {
        number: '03',
        title: 'Магазинът не продава липсваща стока',
        text: 'Наличността идва на живо от складовата система, за всеки размер.',
        vignette: {
          kind: 'stock-link',
          labels: {
            warehouse: 'Склад',
            count: '27',
            page: 'Продуктова страница',
            size: '1000 × 2000 mm',
            pill: '27 налични',
          },
        },
      },
      {
        number: '04',
        title: 'Размерите по поръчка получават цена веднага',
        text: 'Цените се смятаха на ръка. Сега клиентът въвежда отвора, вижда го начертан в мащаб и веднага получава цена и срок.',
        vignette: {
          kind: 'custom-size',
          labels: {
            width: 'Ширина',
            widthValue: '1000 mm',
            length: 'Дължина',
            lengthValue: '2000 mm',
            widthDim: '1000',
            lengthDim: '2000',
            pill: 'Цена и срок са готови',
          },
        },
      },
    ],
  },
  results: {
    kicker: 'Резултати',
    heading: 'Готово за всичките девет магазина, които тръгват един по един.',
    numbers: [
      { value: '9 → 1', label: 'магазина на една платформа' },
      { value: '1', label: 'каталог за всяка марка и държава' },
      { value: '1', label: 'място за редакция на съдържанието за всички магазини' },
    ],
  },
  built: {
    kicker: 'Как е изградено',
    heading: 'Отговарях за всеки слой.',
    steps: [
      { number: '01', title: 'Каталог', text: 'Medusa, един списък с продукти, цени за всеки пазар' },
      { number: '02', title: 'Витрина', text: 'Next.js, един код за всеки домейн' },
      { number: '03', title: 'Съдържание', text: 'Payload, отделно пространство за всеки магазин' },
      { number: '04', title: 'Наличност', text: 'На живо от системата за управление на склада' },
      { number: '05', title: 'Сървър', text: 'Docker на частен сървър' },
    ],
  },
  next: {
    kicker: 'Следващ казус',
    title: 'Сайт на езиково училище',
  },
  footer: {
    left: '© Даниела Георгиева',
    right:
      '* Имената на клиентите са заместители, а логата им са скрити заради поверителност. Истинските при поискване.',
  },
};

/**
 * Custom size demo (the РАЗМЕР ПО ПОРЪЧКА tab). The tab is not drawn in Figma; the words are
 * the ones on change card 04 ("Ширина", "Дължина", "mm"). `drawing` is not in Figma: the
 * accessible name of the drawing, with {w} and {l} replaced by the typed values.
 */
export const customSize = {
  width: 'Ширина',
  length: 'Дължина',
  unit: 'mm',
  drawing: 'Отвор, начертан в мащаб: {w} × {l} mm',
};
