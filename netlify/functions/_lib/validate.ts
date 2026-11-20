// Validation for the booking request. Pure functions, no I/O.

export const LIMITS = { name: 80, email: 120, message: 1000, start: 40, hp_ref: 200 } as const;
export const MAX_BODY_BYTES = 10_000;

export type Lang = 'en' | 'bg';

export interface Booking {
  /** Epoch milliseconds of the slot start. */
  start: number;
  name: string;
  email: string;
  message: string;
  lang: Lang;
}

export type Validation =
  | { ok: true; honeypot: true }
  | { ok: true; honeypot: false; booking: Booking }
  | { ok: false };

// C0 and C1 control characters, plus the Unicode bidirectional overrides and isolates that
// can reorder text in a calendar invite. Built with RegExp so the source stays plain ASCII.
const CONTROL = new RegExp('[\\u0000-\\u001F\\u007F-\\u009F\\u202A-\\u202E\\u2066-\\u2069\\uFEFF]', 'g');
const CONTROL_KEEP_NEWLINE = new RegExp(
  '[\\u0000-\\u0009\\u000B-\\u001F\\u007F-\\u009F\\u202A-\\u202E\\u2066-\\u2069\\uFEFF]',
  'g',
);

// Zero-width and directional characters: U+200B to U+200F and U+2060 to U+2064. They are
// invisible, can hide a link from the checks below ("ht<zero width>tp://") and can reorder
// what the reader sees. Input that contains one is refused.
const INVISIBLE = new RegExp('[\\u200B-\\u200F\\u2060-\\u2064]');

// The name and the message end up in a calendar event on the owner's calendar, so neither may
// carry a clickable link: a scheme or "www.". A bare "domain.tld/path" is allowed on purpose:
// people describing a project write things like "Next.js/React", and since the site never
// emails a visitor-supplied address (zero relay) only the owner reads this text.
const LINK_SCHEME = /(https?:|www\.|:\/\/)/i;

export function hasLink(value: string): boolean {
  return LINK_SCHEME.test(value);
}

// Letters and combining marks in any script, then also spaces, dots, apostrophes and hyphens.
const NAME = /^[\p{L}\p{M}][\p{L}\p{M} .'\u2019-]*$/u;

/** One line of plain text: control characters removed, whitespace collapsed. */
export function cleanLine(value: string): string {
  return value.normalize('NFC').replace(CONTROL, ' ').replace(/\s+/g, ' ').trim();
}

/** Plain text that may span lines: control characters removed, at most one blank line in a row. */
export function cleanText(value: string): string {
  return value
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL_KEEP_NEWLINE, ' ')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Google Calendar renders a subset of HTML in event descriptions, so text is escaped. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** For plain-text fields such as the event title: no angle brackets at all. */
export function stripAngles(value: string): string {
  return value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
}

// Deliberately stricter than RFC 5322: one @, a dotted domain, and none of the characters
// that could smuggle a second address or a header into an invite.
const EMAIL = /^[a-z0-9.!#$%&*+/=?^_{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;

export function isEmail(value: string): boolean {
  if (value.length > LIMITS.email || !EMAIL.test(value)) return false;
  const [local, domain] = value.split('@');
  return local.length <= 64 && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..') && domain.length <= 253;
}

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?Z$/;

/** Parses an ISO 8601 UTC timestamp ("2026-11-25T09:00:00.000Z"). Returns null for anything else. */
export function parseStart(value: unknown): number | null {
  if (typeof value !== 'string' || value.length > LIMITS.start || !ISO_UTC.test(value)) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

export function validateBooking(input: unknown): Validation {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return { ok: false };
  const body = input as Record<string, unknown>;

  // Honeypot first: a filled "hp_ref" field is a bot, and it gets the same answer as a
  // real booking so it learns nothing. The name means nothing on purpose: a field called
  // "company" or "website" is filled in by browser autofill and password managers.
  if (body.hp_ref !== undefined && body.hp_ref !== null) {
    if (typeof body.hp_ref !== 'string') return { ok: false };
    if (body.hp_ref.trim() !== '') return { ok: true, honeypot: true };
  }

  const { name, email, message } = body;
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return { ok: false };
  }
  // Over-long input is rejected, never silently cut.
  if (name.length > LIMITS.name || email.length > LIMITS.email || message.length > LIMITS.message) {
    return { ok: false };
  }

  if (INVISIBLE.test(name) || INVISIBLE.test(message)) return { ok: false };
  // Checked before cleaning as well, with the invisible control characters taken out, so a
  // link cannot be split by a character that cleaning would turn into a space. Line breaks
  // and tabs stay, or the end of one line and the start of the next could read as a link.
  const joined = (v: string) => v.replace(CONTROL, (c) => (/\s/.test(c) ? c : ''));
  if (hasLink(joined(name)) || hasLink(joined(message))) return { ok: false };

  const cleanName = cleanLine(name);
  const cleanEmail = email.trim();
  const cleanMessage = cleanText(message);
  if (!cleanName || !cleanMessage || !isEmail(cleanEmail)) return { ok: false };
  if (!NAME.test(cleanName)) return { ok: false };
  if (hasLink(cleanName) || hasLink(cleanMessage)) return { ok: false };

  const start = parseStart(body.start);
  if (start === null) return { ok: false };

  const lang: Lang = body.lang === 'bg' ? 'bg' : 'en';
  return {
    ok: true,
    honeypot: false,
    booking: { start, name: cleanName, email: cleanEmail, message: cleanMessage, lang },
  };
}
