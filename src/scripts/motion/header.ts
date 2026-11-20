// Home · Toggles: the glass header slides down once the visitor has scrolled past the hero.
// Functional, not decorative, so it also runs under reduced motion (base.css removes the
// slide there and the header simply appears).
export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header="reveal"]');
  if (!header) return;
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) {
    header.classList.add('is-visible');
    return;
  }
  new IntersectionObserver(([entry]) => {
    header.classList.toggle('is-visible', !entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
  }).observe(hero);
}
