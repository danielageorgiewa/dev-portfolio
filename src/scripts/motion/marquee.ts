// Home · Marquee: row 1 loops left in 40s, row 2 loops right in 50s, and scroll speed adds
// to both. The markup repeats each row three times; one cycle is a third of the track.
// Desktop only (the phone frame has no marquee and the CSS hides it there).
import gsap from 'gsap';
import type { Cleanup, MotionEnv } from './env';

const PERIOD = { left: 40, right: 50 };
const SCROLL_BOOST = 0.55;

export function marquee(env: MotionEnv): Cleanup | void {
  const root = document.querySelector<HTMLElement>('[data-marquee]');
  if (!root || !env.desktop) return;

  const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-marquee-row]')).flatMap((row) => {
    const track = row.firstElementChild as HTMLElement | null;
    if (!track) return [];
    const right = row.dataset.marqueeRow === 'right';
    return [{ track, dir: right ? 1 : -1, period: right ? PERIOD.right : PERIOD.left, cycle: 0, x: 0 }];
  });
  if (!rows.length) return;

  const measure = () => {
    for (const row of rows) {
      const cycle = row.track.offsetWidth / 3;
      // Keep the phase when the size changes; a right-moving row starts one cycle back.
      row.x = row.cycle ? (row.x / row.cycle) * cycle : row.dir > 0 ? -cycle : 0;
      row.cycle = cycle;
    }
  };
  measure();
  const resize = new ResizeObserver(measure);
  for (const row of rows) resize.observe(row.track);

  let active = false;
  const io = new IntersectionObserver(([entry]) => {
    active = entry.isIntersecting;
  });
  io.observe(root);

  let lastY = window.scrollY;
  let velocity = 0;
  const tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(deltaMs, 100) / 1000;
    const y = window.scrollY;
    const raw = dt > 0 ? Math.abs(y - lastY) / dt : 0;
    lastY = y;
    velocity += (raw - velocity) * 0.12;
    if (!active) return;
    for (const row of rows) {
      if (!row.cycle) continue;
      row.x += row.dir * (row.cycle / row.period + velocity * SCROLL_BOOST) * dt;
      if (row.x <= -row.cycle) row.x += row.cycle;
      else if (row.x > 0) row.x -= row.cycle;
      row.track.style.transform = `translate3d(${row.x.toFixed(2)}px,0,0)`;
    }
  };
  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    io.disconnect();
    resize.disconnect();
    for (const row of rows) row.track.style.transform = '';
  };
}
