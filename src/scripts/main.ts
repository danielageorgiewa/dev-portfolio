// Entry point for progressive enhancement. The site is fully readable without this file:
// it only adds motion and the booking widget to markup that is already on the page.
// (`html.js` itself is set by the inline script in the <head> of layouts/Base.astro.)
import { boot } from './motion';
import { initCopy } from './copy';

document.documentElement.classList.add('js');
boot();
initCopy();

// The booking widget (scripts/booking.ts) is fetched only on pages that have one.
// import.meta.glob keeps the build green while that file does not exist yet.
const booking = import.meta.glob<{ initBooking?: () => void }>('./booking.ts');
if (document.querySelector('[data-booking]')) {
  for (const load of Object.values(booking)) {
    load()
      .then((module) => module.initBooking?.())
      .catch((error) => console.error('[booking]', error));
  }
}
