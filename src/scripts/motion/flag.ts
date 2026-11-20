// Hidden second flag. Nothing on the page shows it: it is in an HTML comment, in the console,
// in a data attribute on the footer and in the X-Flag response header, so only devtools finds
// it. Typing it anywhere (outside form fields) scrolls to the booking section of the home page
// in the current language.
import { goTo } from './scroll';

const FLAG = 'dg{l3ts_t4lk}';

export function initFlag(): void {
  console.log(
    `%c${FLAG}%c  type it anywhere on the page.`,
    'font:500 13px ui-monospace,Menlo,monospace;color:#f2f0ed;background:#b3202a;padding:3px 8px;border-radius:2px',
    'font:12px ui-monospace,Menlo,monospace;color:#716660',
  );

  const lang = document.documentElement.lang === 'bg' ? 'bg' : 'en';
  const destination = () => `/${lang}/#contact`;

  let typed = '';
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
    const el = event.target as HTMLElement | null;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) {
      typed = '';
      return;
    }
    typed = (typed + event.key).slice(-FLAG.length);
    if (typed === FLAG) {
      typed = '';
      goTo(destination());
    }
  });
}
