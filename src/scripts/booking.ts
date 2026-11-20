// Booking widget (Contact section). Loaded by main.ts only when [data-booking] is on the page.
//
// The HTML ships with the widget hidden and the email link visible. This script reveals the
// widget only while it has something real to show: loading skeletons, free slots, the form,
// a result. If the availability function fails, times out or says it is not configured, the
// widget is hidden again and the email link is all that is left. Nothing is announced.

const AVAILABILITY_URL = '/api/availability';
const BOOK_URL = '/api/book';
const AVAILABILITY_TIMEOUT = 5000;
const BOOK_TIMEOUT = 20000;
const SLOT_COUNT = 6;
const STAGGER_MS = 40; // "pop in 0.04s apart"

type BookReason = 'taken' | 'invalid' | 'rate_limited' | 'unavailable';

async function fetchJson(url: string, init: RequestInit, timeout: number): Promise<{ status: number; body: unknown }> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // A non-JSON answer (for example the platform's own 429 page) is handled by status.
    }
    return { status: res.status, body };
  } finally {
    window.clearTimeout(timer);
  }
}

/** Slot starts from the availability function, or null when the widget should not be shown. */
async function loadSlots(): Promise<Date[] | null> {
  try {
    const { status, body } = await fetchJson(AVAILABILITY_URL, { headers: { accept: 'application/json' } }, AVAILABILITY_TIMEOUT);
    if (status !== 200 || typeof body !== 'object' || body === null) return null;
    const slots = (body as { slots?: unknown }).slots;
    if (!Array.isArray(slots)) return null;
    const now = Date.now();
    return slots
      .filter((s): s is string => typeof s === 'string')
      .map((s) => new Date(s))
      .filter((d) => Number.isFinite(d.getTime()) && d.getTime() > now)
      .sort((a, b) => a.getTime() - b.getTime());
  } catch {
    return null;
  }
}

/** "Wed 11:00" in the visitor's own time zone and the page language, 24-hour clock. */
function slotLabels(slots: Date[], lang: string): { short: string[]; long: string[] } {
  const locale = lang === 'bg' ? 'bg-BG' : 'en-GB';
  const parts = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const longFormat = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const read = (date: Date) => {
    const out: Record<string, string> = {};
    for (const p of parts.formatToParts(date)) out[p.type] = p.value;
    const weekday = out.weekday.replace(/\.$/, '');
    return {
      weekday: weekday.charAt(0).toLocaleUpperCase(locale) + weekday.slice(1),
      day: out.day,
      time: `${out.hour}:${out.minute}`,
    };
  };
  const read_ = slots.map(read);
  // Seven days ahead can reach the same weekday twice (today and a week from today).
  // Only then is the day of the month added, so the two cannot be mixed up.
  const dayOf = new Map<string, string>();
  const ambiguous = read_.some((r) => {
    const seen = dayOf.get(r.weekday);
    dayOf.set(r.weekday, r.day);
    return seen !== undefined && seen !== r.day;
  });
  return {
    short: read_.map((r) => (ambiguous ? `${r.weekday} ${r.day}, ${r.time}` : `${r.weekday} ${r.time}`)),
    long: slots.map((d) => longFormat.format(d)),
  };
}

export function initBooking(): void {
  const root = document.querySelector<HTMLElement>('[data-booking]');
  if (!root || root.dataset.bookingReady) return;
  root.dataset.bookingReady = 'true';

  const ui = root.querySelector<HTMLElement>('[data-booking-ui]');
  const slotsEl = root.querySelector<HTMLElement>('[data-slots]');
  const bookBtn = root.querySelector<HTMLButtonElement>('[data-book]');
  const form = root.querySelector<HTMLFormElement>('[data-booking-form]');
  const message = root.querySelector<HTMLElement>('[data-booking-message]');
  const emailCta = root.querySelector<HTMLElement>('[data-booking-email]');
  const fallback = root.querySelector<HTMLElement>('[data-booking-fallback]');
  const cancel = root.querySelector<HTMLButtonElement>('[data-booking-cancel]');
  if (!ui || !slotsEl || !bookBtn || !form || !message) return;
  const submitBtn = form.querySelector<HTMLButtonElement>('[type="submit"]');

  const lang = root.dataset.lang ?? document.documentElement.lang ?? 'en';
  const text = {
    noSlots: root.dataset.noSlots ?? '',
    sending: root.dataset.sending ?? '',
    success: root.dataset.success ?? '',
    error: root.dataset.error ?? '',
    taken: root.dataset.taken ?? root.dataset.error ?? '',
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let selected: string | null = null;
  let sending = false;

  const say = (value: string) => {
    message.textContent = value;
  };

  function showSkeletons(): void {
    const items: HTMLElement[] = [];
    for (let i = 0; i < SLOT_COUNT; i++) {
      const el = document.createElement('span');
      el.className = 'booking__slot booking__slot--skeleton';
      el.setAttribute('aria-hidden', 'true');
      items.push(el);
    }
    slotsEl!.replaceChildren(...items);
    slotsEl!.setAttribute('aria-busy', 'true');
  }

  function select(iso: string | null): void {
    selected = iso;
    for (const btn of slotsEl!.querySelectorAll<HTMLButtonElement>('button[data-start]')) {
      btn.setAttribute('aria-pressed', String(btn.dataset.start === iso));
    }
    bookBtn!.setAttribute('aria-disabled', String(iso === null));
  }

  function showSlots(slots: Date[]): void {
    const labels = slotLabels(slots, lang);
    const buttons = slots.map((date, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'booking__slot';
      btn.dataset.start = date.toISOString();
      btn.setAttribute('aria-pressed', 'false');
      btn.title = labels.long[i];
      const time = document.createElement('time');
      time.dateTime = date.toISOString();
      time.textContent = labels.short[i];
      btn.append(time);
      return btn;
    });
    slotsEl!.replaceChildren(...buttons);
    slotsEl!.removeAttribute('aria-busy');
    popIn(buttons);
  }

  /** Slots pop in one after another. With reduced motion they are simply there. */
  function popIn(buttons: HTMLElement[]): void {
    if (reduceMotion.matches) return;
    buttons.forEach((btn, i) => {
      btn.animate(
        [
          { opacity: 0, transform: 'translateY(6px) scale(0.96)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 320, delay: i * STAGGER_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' },
      );
    });
  }

  function showEmpty(): void {
    slotsEl!.replaceChildren();
    slotsEl!.removeAttribute('aria-busy');
    slotsEl!.hidden = true;
    bookBtn!.hidden = true;
    form!.hidden = true;
    say(text.noSlots);
    // The "Email me" button takes over from the smaller email line under the widget.
    if (emailCta) {
      emailCta.hidden = false;
      if (fallback) fallback.hidden = true;
    }
  }

  /** Loads and draws the slots. `skip` is a start time the server has just said is gone. */
  async function refresh(first: boolean, skip?: string): Promise<void> {
    select(null);
    slotsEl!.hidden = false;
    bookBtn!.hidden = !form!.hidden;
    if (emailCta) emailCta.hidden = true;
    if (fallback) fallback.hidden = false;
    showSkeletons();
    ui!.hidden = false;

    const all = await loadSlots();
    if (all === null) {
      if (first) {
        // Not configured, failed or too slow: back to the email link alone, silently.
        ui!.hidden = true;
        slotsEl!.replaceChildren();
        return;
      }
      // The widget was already in use, so say that it stopped working.
      slotsEl!.replaceChildren();
      slotsEl!.hidden = true;
      bookBtn!.hidden = true;
      form!.hidden = true;
      say(text.error);
      return;
    }
    const slots = all.filter((d) => d.toISOString() !== skip).slice(0, SLOT_COUNT);
    if (slots.length === 0) showEmpty();
    else showSlots(slots);
  }

  slotsEl.addEventListener('click', (event) => {
    const btn = (event.target as Element).closest<HTMLButtonElement>('button[data-start]');
    if (!btn || sending) return;
    select(btn.dataset.start ?? null);
    say('');
  });

  bookBtn.addEventListener('click', () => {
    if (!selected) {
      // Nothing picked yet: point at the slots instead of doing nothing.
      const buttons = [...slotsEl.querySelectorAll<HTMLButtonElement>('button[data-start]')];
      popIn(buttons);
      buttons[0]?.focus();
      return;
    }
    form.hidden = false;
    bookBtn.hidden = true;
    say('');
    form.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
  });

  cancel?.addEventListener('click', () => {
    if (sending) return;
    form.hidden = true;
    bookBtn.hidden = false;
    say('');
    bookBtn.focus();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending || !selected) return;
    const start = selected;
    const data = new FormData(form);
    const field = (name: string) => String(data.get(name) ?? '');

    sending = true;
    form.setAttribute('aria-busy', 'true');
    if (submitBtn) submitBtn.disabled = true;
    say(text.sending);

    let ok = false;
    let reason: BookReason | null = null;
    try {
      const { status, body } = await fetchJson(
        BOOK_URL,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({
            start,
            name: field('name'),
            email: field('email'),
            message: field('message'),
            hp_ref: field('hp_ref'),
            lang,
          }),
        },
        BOOK_TIMEOUT,
      );
      const result = (typeof body === 'object' && body !== null ? body : {}) as { ok?: unknown; reason?: unknown };
      ok = status === 200 && result.ok === true;
      if (!ok && result.reason === 'taken') reason = 'taken';
    } catch {
      ok = false;
    }

    sending = false;
    form.removeAttribute('aria-busy');
    if (submitBtn) submitBtn.disabled = false;

    if (ok) {
      form.hidden = true;
      form.reset();
      slotsEl.hidden = true;
      bookBtn.hidden = true;
      if (fallback) fallback.hidden = true;
      say(text.success);
      message.focus();
      return;
    }

    if (reason === 'taken') {
      // Keep what the visitor typed, close the form and offer the slots that are left.
      form.hidden = true;
      say(text.taken);
      await refresh(false, start);
      const next = slotsEl.querySelector<HTMLButtonElement>('button[data-start]');
      (next ?? message).focus();
      return;
    }

    say(text.error);
    message.focus();
  });

  // Ask for slots only when the visitor gets near the section: most page views never reach
  // it, and each request is a function call and a Google API call.
  const start = () => void refresh(true);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          start();
        }
      },
      { rootMargin: '1200px 0px' },
    );
    observer.observe(root);
  } else {
    start();
  }
}
