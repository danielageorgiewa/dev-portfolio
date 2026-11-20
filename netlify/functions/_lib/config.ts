// Where the booking functions find the calendar. Nothing here is a secret: the username and
// the event slug are the two parts of the public booking page address,
// cal.com/<username>/<event slug>. The functions use no API key.

export type Env = Record<string, string | undefined>;
export type Fetch = typeof fetch;

/** The Cal.com account whose event type is booked. */
export const CAL_USERNAME = 'daniela-georgieva-rajxiy';
/** The event type: 30 minutes, Google Meet, Monday to Friday 11:00 to 16:00 Sofia time. */
export const CAL_EVENT_SLUG = '30min';
/** Identifier of the required booking question "What are you building?" on that event type. */
export const CAL_QUESTION_FIELD = 'building';

export const CAL_API = 'https://api.cal.com/v2';
// Cal.com versions each endpoint on its own, by date, in the cal-api-version header. These
// are the values its API reference gives for "Get available time slots for an event type"
// and "Create a booking". A wrong value silently selects an older version of the endpoint.
export const CAL_SLOTS_VERSION = '2024-09-04';
export const CAL_BOOKINGS_VERSION = '2026-02-25';

// Netlify stops a function after 10 seconds. A booking makes two Cal.com calls one after the
// other (read the day's slots, then create the booking), so the worst case is
// 2500 + 6500 = 9000 ms. Creating the booking gets the longest share on purpose: Cal.com
// creates the Meet link and sends the emails inside that call, and giving up on it too early
// would report a failure for a booking Cal.com then goes on to make.
export const SLOTS_TIMEOUT_MS = 2500;
export const BOOKING_TIMEOUT_MS = 6500;
/** The availability function makes one call, and the page waits five seconds for it. */
export const AVAILABILITY_TIMEOUT_MS = 4000;

/** Per-call limits in milliseconds. Tests shorten them. */
export interface Timeouts {
  availability: number;
  slots: number;
  booking: number;
}
export const DEFAULT_TIMEOUTS: Timeouts = {
  availability: AVAILABILITY_TIMEOUT_MS,
  slots: SLOTS_TIMEOUT_MS,
  booking: BOOKING_TIMEOUT_MS,
};

export interface CalConfig {
  username: string;
  eventSlug: string;
}

// What a Cal.com username or event slug can look like. An override that does not fit is
// ignored, so a typo in Netlify falls back to the values above instead of sending junk.
const SLUG = /^[a-z0-9][a-z0-9._-]{0,99}$/i;

/**
 * The account and event type to use. The optional variables CAL_USERNAME and CAL_EVENT_SLUG
 * replace the constants above, so either can change in Netlify without a code change.
 */
export function readCalConfig(env: Env): CalConfig {
  const username = env.CAL_USERNAME?.trim() ?? '';
  const eventSlug = env.CAL_EVENT_SLUG?.trim() ?? '';
  return {
    username: SLUG.test(username) ? username : CAL_USERNAME,
    eventSlug: SLUG.test(eventSlug) ? eventSlug : CAL_EVENT_SLUG,
  };
}
