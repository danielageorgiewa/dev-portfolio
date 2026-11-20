// Case study · Warehouse management system, Bulgarian. Word for word from Figma (91:408).
// A real translation, not a mirror of the English: never regenerate or re-translate it.
// Dates and production claims are exactly as Figma has them.
// Strings marked "Not in Figma" are functional (alt text, accessible names).
import type { CaseContent } from '../case';

export const warehouse: CaseContent = {
  slug: 'warehouse-management-system',
  author: 'Даниела Георгиева',
  intro: {
    back: 'Всички проекти',
    kicker: 'Казус · 03',
    title: 'Система за <em>управление на склад</em>',
    lead: 'Производител на покривни прозорци водеше наличностите на няколко сайта и търговски портал в една обща таблица. Поръчки се губеха, а бройките не излизаха. Пуснах новата система за управление на склада и прехвърлих бизнеса на нея стъпка по стъпка. Таблицата вече я няма, а системата е свързана директно с всеки сайт. Работи в продукция от август 2026 г., а релийзите и поддръжката са мои.',
    facts: [
      { key: 'Клиент', value: 'Aperta* · Производител на покривни прозорци' },
      { key: 'Какво направих', value: 'Разработка, внедряване и поддръжка' },
      { key: 'Резултат', value: 'Наличности, поръчки, товарения и ежедневна проверка' },
      { key: 'Технологии', chips: ['TypeScript', 'Node', 'PostgreSQL', 'Next.js', 'Docker'] },
    ],
  },
  screens: {
    // Figma names four tabs (ДНЕС, ПОРЪЧКИ, НАЛИЧНОСТ, СЪСТОЯНИЕ) but draws only the Today
    // screen (91:443), so there are no redacted Orders, Stock or Health composites to export
    // yet. When they exist, add { id: 'orders', label: 'ПОРЪЧКИ' },
    // { id: 'stock', label: 'НАЛИЧНОСТ' } and { id: 'health', label: 'СЪСТОЯНИЕ' } here and
    // their alt texts below.
    tabs: [{ id: 'today', label: 'ДНЕС' }],
    caption: 'Екраните са с примерни данни.',
    // Not in Figma.
    tablistLabel: 'Екрани',
    alt: {
      today: 'Екран „Днес“ на системата за управление на склад с примерни данни, логото на клиента е скрито',
    },
    openLabel: 'Отвори екрана в пълен размер',
    frame: {
      expand: 'Разгъни',
      shrink: 'Свий',
      scroll: 'Екранна снимка. Превъртете, за да видите останалата част.',
    },
  },
  started: {
    kicker: 'Откъде започнахме',
    heading: 'Пет канала за продажба вървяха през една таблица.',
    text: 'Всяка продажба и доставка влизаше в една и съща таблица, на ръка или от стар скрипт, без запис кой е сменил число и защо.',
    foundKicker: 'Какво преброих в старата система',
    rows: [
      { value: '47', label: 'реда от поръчки сваляха наличност от грешен продукт' },
      { value: '~216', label: 'поръчки, вероятно изгубени заради повтарящи се номера между сайтовете' },
      { value: '3 417', label: 'реда от поръчки с продуктови кодове, които таблицата не разпознаваше' },
      { value: '0', label: 'автоматични проверки на логиката за наличности' },
      { value: 'Никакъв', label: 'запис кой е променил наличност и защо' },
    ],
  },
  changes: {
    kicker: 'Какво се промени',
    heading: 'Какво се промени <em>за екипа.</em>',
    cards: [
      {
        number: '01',
        title: 'Всеки канал продава от една наличност',
        text: 'Трите сайта и търговският портал четат едни и същи числа от системата.',
        vignette: {
          kind: 'channels',
          labels: {
            channel1: 'Сайт 1',
            channel2: 'Сайт 2',
            channel3: 'Сайт 3',
            channel4: 'Търговски портал',
            stock: 'Наличност · ELB 24',
            count: '52',
            caption: 'една наличност за всички канали',
          },
        },
      },
      {
        number: '02',
        title: 'Грешките се проследяват за секунди',
        text: 'Всяко движение на наличност пази кой го е направил и защо.',
        vignette: {
          kind: 'stock-log',
          labels: {
            title: 'Дневник на наличността',
            change1: '−2',
            code1: 'ELB 24',
            reason1: 'Поръчка 1042',
            who1: 'Даниела',
            change2: '+40',
            code2: 'ELB 25',
            reason2: 'Доставка',
            who2: 'Склад',
            change3: '−1',
            code3: 'SKY 60',
            reason3: 'Повреда',
            who3: 'Склад',
          },
        },
      },
      {
        number: '03',
        title: 'Липсващите поръчки се откриват до един ден',
        text: 'Ежедневна проверка сравнява поръчките от всеки сайт със системата и отбелязва всичко, което не е пристигнало.',
        vignette: {
          kind: 'daily-check',
          labels: {
            title: 'Ежедневна проверка · 06:00',
            name1: 'Сайт 1',
            count1: '18/18',
            name2: 'Сайт 2',
            count2: '9/9',
            name3: 'Търговски портал',
            count3: '6/6',
            name4: 'Сайт 3',
            count4: '11/12',
            pill: '1 липсва',
          },
        },
      },
      {
        number: '04',
        title: 'Преходът не спря продажбите',
        text: 'Новата система работеше редом с таблицата и пое каналите един по един.',
        vignette: {
          kind: 'switch-over',
          labels: {
            old: 'Таблица',
            new: 'Нова система',
            channel1: 'Сайт 1',
            channel2: 'Сайт 2',
            channel3: 'Сайт 3',
            channel4: 'Търговски портал',
          },
        },
      },
    ],
  },
  results: {
    kicker: 'Резултати',
    heading: 'Всеки канал вече има точна наличност.',
    numbers: [
      { value: '47 → 0', label: 'продажби, сваляли наличност от грешен продукт' },
      { value: '5', label: 'канала за продажба с една обща наличност' },
      { value: '0 → 659', label: 'автоматични проверки на логиката за наличности' },
    ],
    method: 'Преброено от старата таблица и от записите на новата система.',
    // The band is project/sis (#8e1b24) in Figma, not the default ink.
    tone: 'project-sis',
  },
  built: {
    kicker: 'Как е изградено',
    heading: 'Отговарях за всяка стъпка.',
    steps: [
      {
        number: '01',
        title: 'Входящи поръчки',
        text: 'Всеки сайт и порталът изпращат поръчката в момента, в който е направена',
        // Two lines in Figma (91:520): it is wider than the card.
        wrap: true,
      },
      { number: '02', title: 'Проверки', text: 'Всяка поръчка се отчита точно веднъж, дори да пристигне два пъти' },
      { number: '03', title: 'Регистър', text: 'PostgreSQL, всяко движение на наличност се пази с автор и причина' },
      { number: '04', title: 'Табло', text: 'Днес, поръчки, наличност, товарения и състояние за екипа' },
      {
        number: '05',
        title: 'Сървър',
        text: 'Docker на частен сървър, с резервно копие всяка нощ, релийзи през GitHub Actions и rollback с една стъпка',
      },
    ],
  },
  next: {
    kicker: 'Следващ казус',
    // Set without italics in this band (91:549).
    title: 'Една платформа, девет магазина, <em>луксозен вид.</em>',
  },
  footer: {
    left: '© Даниела Георгиева',
    right: '* Имената на клиентите са заместители, а логата им са скрити заради поверителност. Истинските при поискване.',
  },
};
