# danielageorgieva.work

Daniela Georgieva's portfolio: a home page, three case studies and a CV, each in English and
Bulgarian. It is a static [Astro](https://astro.build) site with plain CSS, hosted on Netlify.
The only server code is two small Netlify functions behind the "Book this time" widget in
the Contact section. They read free times from Cal.com and book the call there.

Netlify publishes the `main` branch to https://danielageorgieva.work. **Every push to `main`
goes live.**

- [Running locally](#running-locally)
- [Environment variables](#environment-variables)
- [How booking works](#how-booking-works)
- [Cal.com setup](#calcom-setup)
- [Regenerating the CV PDFs](#regenerating-the-cv-pdfs)
- [Deploying](#deploying)
- [Privacy rules for screenshots](#privacy-rules-for-screenshots)

## Running locally

You need Node 22 (see `.nvmrc`).

```
npm install
npm run dev        # the site on http://localhost:4321
```

Other commands:

```
npm run build      # static build into dist/
npm run preview    # serve dist/
npm run check      # type-check the Astro project
npm test           # tests for the booking functions
```

`npm run dev` serves the pages only. The booking functions do not run there, so the Contact
section shows the email link, which is also what visitors see whenever booking is not
available.

To run the functions too, use the Netlify CLI. It starts the Astro dev server and the
functions together:

```
npx netlify dev    # the site and /api/* on http://localhost:8888
```

It works without logging in or linking the site, and it reads `.env` if there is one. The
functions need no secrets, so the widget shows the real free times. A booking made there is
a real booking on Cal.com, with real emails.

Notes:

- The root URL `/` always redirects to the English site, `/en/`, on Netlify. That rule is in
  `netlify.toml`. Under `npm run dev` and `npm run preview`
  the root is a small page that forwards to `/en/`.
- To screenshot a page for comparison with Figma:
  `node scripts/shot.mjs <url> <width> <out.png> [--no-js] [--reduced-motion]`.

## Environment variables

None are required, and there are no secrets. The booking functions use Cal.com's public API
without a key. Two optional names are listed in `.env.example`:

| Name | What it is |
| --- | --- |
| `CAL_USERNAME` | Optional. The Cal.com username. Default: `daniela-georgieva-rajxiy` |
| `CAL_EVENT_SLUG` | Optional. The event type's slug. Default: `30min` |

Together they are the public booking address, `cal.com/<username>/<event slug>`. The
defaults are constants in `netlify/functions/_lib/config.ts`. Set a variable only to point
the site at another account or event type without a code change: in Netlify under **Site
configuration > Environment variables**, then redeploy (**Deploys > Trigger deploy > Deploy
site**), because variables only reach the functions on a new deploy. A value that does not
look like a username or a slug is ignored and the default is used.

## How booking works

- `GET /api/availability` (`netlify/functions/availability.ts`) asks Cal.com for the free
  slots from today to seven days ahead (Sofia dates) and returns the first six that have
  not started, as UTC start times and nothing else. The answer is cached for one minute. A
  request with a query string gets a 400. If Cal.com cannot be reached the answer is a 502.
- `POST /api/book` (`netlify/functions/book.ts`) takes the chosen slot, a name, an email, a
  short message and the visitor's time zone. It checks every field, asks Cal.com for that
  day's slots again and requires the chosen time to be one of them, and then creates the
  booking on Cal.com. The message is sent as the answer to the booking question "What are
  you building?".
- The page (`src/scripts/booking.ts`) shows the slots in the visitor's own time zone. It
  only talks to these two functions, never to Cal.com directly. If the availability call
  fails or takes more than five seconds, the widget stays out of the way and the email link
  is shown.
- Names, emails, messages and Cal.com's answers are never written to the logs. A failure is
  logged as a step name and a status code, for example `book: cal booking 500`.

### What Cal.com does, and who gets an email

Cal.com owns the calendar side: the working hours, the slot length, the minimum notice, the
busy times from the connected calendar, the Google Meet link and all the emails.

When a visitor books, Cal.com creates the event and emails a confirmation with the invite
to **the address the visitor typed** and to you. The emails to the visitor are in English or
Bulgarian, matching the page they booked from, with times in their time zone.

### What the visitor is told

The function answers `{ "ok": true }` or `{ "ok": false, "reason": ... }`:

| Reason | When |
| --- | --- |
| `taken` | The time is not in Cal.com's list any more, or Cal.com refused it as already booked, too soon or out of range. The page offers the times that are left |
| `invalid` | A field failed the checks here, or Cal.com refused a field |
| `rate_limited` | Too many attempts from one visitor, too many bookings for one email address, or Cal.com answered 429 |
| `unavailable` | Cal.com did not answer in time or answered with any other error |

For everything except `taken` the page shows its short error line and the email link.

The two Cal.com calls of a booking have time limits of 2.5 and 6.5 seconds, so the function
always answers inside Netlify's 10 second limit. If Cal.com is so slow that the second call
is cut off, the visitor sees the error line even though Cal.com may still finish the
booking. In that rare case both of you still get Cal.com's emails.

### Abuse protection

Because Cal.com emails whatever address is typed into the form, the form could be used to
send an unwanted invite to a stranger. This is what stands in the way:

- **Origin check.** Requests must come from the site itself (or its Netlify previews).
- **Netlify rate limits** per visitor IP, across all function instances: 5 booking attempts
  and 10 availability requests a minute (the `config.rateLimit` block in each function
  file).
- **A second per-IP limit** in the function: 5 booking attempts in 10 minutes.
- **A per-email limit** in the function: the same address can be booked at most 2 times an
  hour. Both in-function limits live in the memory of one running copy of the function.
  Netlify can run several copies and restarts them when idle, so treat these two as speed
  bumps, not guarantees.
- **A hidden field** that simple bots fill in. They get a normal-looking answer and nothing
  is booked.
- **Text rules.** The name may contain letters in any alphabet, spaces, dots, apostrophes
  and hyphens. A name or message that contains a link (`http:`, `www.`, `://`) is refused,
  and so are invisible zero-width characters. So the invite cannot carry a clickable link
  chosen by the sender.
- **Size limits.** The body is limited to 10 kB, the name to 80 characters, the email to
  120 and the message to 1000.
- **Only real slots.** A booking is only sent for a time Cal.com lists as free in the next
  seven days, so each junk booking uses up one of a small number of slots.

What is not covered: a patient person can still book a few slots with someone else's
address, and that person gets Cal.com's confirmation email. If junk bookings ever appear,
open the event type in Cal.com and turn on **Requires confirmation** (under the event
type's **Advanced** tab). Then each booking waits for your approval. The site needs no
change for that, though the "Booked. The invite is in your inbox." line would then be a
little early, since the invite only goes out once you approve.

## Cal.com setup

The Cal.com side is already set up: the account `daniela-georgieva-rajxiy`, the event type
`30min` (30 minutes, Google Meet, Monday to Friday 11:00 to 16:00 Sofia time) and one
required booking question with the identifier `building` ("What are you building?").

### What the functions call

Both calls go to Cal.com's public API v2 without an API key.

- `GET https://api.cal.com/v2/slots?username=...&eventTypeSlug=...&start=YYYY-MM-DD&end=YYYY-MM-DD&timeZone=Europe/Sofia`
  with the header `cal-api-version: 2024-09-04`.
- `POST https://api.cal.com/v2/bookings` with the header `cal-api-version: 2026-02-25` and
  a JSON body: `start` (UTC), `attendee` (`name`, `email`, `timeZone`, `language`),
  `username`, `eventTypeSlug` and `bookingFieldsResponses.building`.

The address, the two version headers, the question identifier and the time limits are
constants in `netlify/functions/_lib/config.ts`.

### Changing things in Cal.com

- **Working hours, days off, minimum notice, buffers, slot length.** Change them in Cal.com
  (**Availability**, or the event type's own settings). The site follows within a minute.
  No code change and no deploy.
- **The question.** You can reword "What are you building?" freely. Keep its identifier
  `building` and keep it the only required question. The site sends exactly one answer. If
  you rename the identifier or add another required question, Cal.com refuses every booking
  from the site until `CAL_QUESTION_FIELD` in `netlify/functions/_lib/config.ts` (or the
  form) is changed to match.
- **Another event type or account.** Set `CAL_EVENT_SLUG` or `CAL_USERNAME` in Netlify and
  redeploy.
- **Phone number or SMS reminders.** Do not make the attendee phone number required. The
  form does not ask for one.

### Test it

1. Open https://danielageorgieva.work/api/availability. You should see
   `{"slots":["2026-...Z", ...]}` with up to six times. They are in UTC, so 11:00 in Sofia
   shows as `09:00` in winter and `08:00` in summer. `{"slots":[]}` means Cal.com has no
   free time in the next seven days. `{"ok":false}` means Cal.com could not be reached or
   did not know the event type: open **Logs > Functions** in Netlify. The line reads
   `availability: cal slots` followed by Cal.com's status code. `404` means the username or
   the event slug is wrong.
2. Book one real slot by hand. Open the site, scroll to the Contact section, pick a time
   you do not need and book it with an email address you can read. Check that the page says
   "Booked. The invite is in your inbox.", that the confirmation arrives at that address
   with the Meet link, that your answer shows under "What are you building?", and that the
   booking is in Cal.com under **Bookings**.
3. Cancel that booking in Cal.com (**Bookings > Upcoming > Cancel**). The slot is offered
   again within a minute.
4. Locally, the same checks work with `npx netlify dev`.

If booking ever stops working, visitors see the email link or the short error line, so
nothing breaks in public. Look at the function log first: it names the step (`slots` or
`booking`) and Cal.com's status code. A status of `0` means Cal.com did not answer in time.

## Regenerating the CV PDFs

The two PDFs at `/cv/daniela-georgieva-cv-en.pdf` and `/cv/daniela-georgieva-cv-bg.pdf` are
the CV pages (`/en/cv`, `/bg/cv`) printed to A4 by headless Chromium. There is no separate
PDF layout to keep in sync: the page's `@media print` styles in `src/components/cv/` are the
A4 design, and the text comes from `src/content/cv.en.ts` and `src/content/cv.bg.ts`.

The PDFs are **generated locally and committed** in `public/cv/`. Netlify does not build
them (its build image is not assumed to run Chromium), so the deploy serves whatever is in
the repo.

Regenerate them after any change to the CV content (`src/content/cv*.ts`), to the CV
components or their print styles (`src/components/cv/`, `src/pages/[lang]/cv.astro`), or to
the fonts and tokens they use. Do it before committing, and commit the PDFs together with
the change.

```
npm run build      # the script serves dist/, so build first
npm run cv:pdf     # writes public/cv/daniela-georgieva-cv-{en,bg}.pdf
npm run build      # again, so dist/ carries the new PDFs
```

Or against a site that is already running (dev server or preview):

```
npm run cv:pdf -- --base http://localhost:4321
```

The first run on a new machine needs Chromium: `npx playwright install chromium`.

The script prints the page count, the file size and where the sheet ends on the page, and
exits with an error unless each PDF is exactly one A4 page. The page is 842 pt tall; English
ends at about 823 pt and Bulgarian at about 841 pt, so the Bulgarian CV has almost no room
left. If a content change pushes either one to a second page, shorten the text (ask
Daniela) or tighten the print metrics in `src/components/cv/Sheet.astro`.

## Deploying

Push to `main`. Netlify runs `npm run build` and publishes `dist/` together with the
functions in `netlify/functions/`. There are no branches or pull requests in this project,
so check before you push:

```
npm run check
npm test
npm run build
```

Then look at the pages you changed with `npm run preview`, in both languages, at desktop and
phone widths, with JavaScript off and with reduced motion.

What the deploy configuration does:

- `netlify.toml` holds the build settings, the language redirect for `/`, the 404 pages
  per language, the security headers and the long cache lifetime for `/_astro/*`.
- The Content-Security-Policy header is written to `dist/_headers` at the end of each build
  by `scripts/csp-headers.mjs`. It allows scripts from this site and the exact inline
  scripts found in the built pages. If you add an inline script the next build picks it up
  by itself. Inline event attributes such as `onclick="..."` fail the build on purpose.
- `public/.well-known/discord` is a domain verification file. Keep it.

## Privacy rules for screenshots

These apply to every image, recording and text in the repo and on the site.

- Client names on the site are the placeholders used in Figma (Aperta\*, Lightwell\*,
  LingvoMost\*), with the footnote that says so. Real names never appear.
- Client logos stay covered by the Redacted badge. Never redraw a logo or make a new one.
- Screenshots are exported from Figma as the whole composite frame, so the cover, the
  Redacted badge and the rewritten text are baked into the image. Never export the bare
  base image underneath, and never use an image's raw source URL.
- Text inside a screenshot that points to a client is rewritten in Figma with made-up
  facts in the same font and size. No blur patches.
- Raw captures and the hidden recording layers in Figma are never copied into this repo,
  never published and never used as build input.
- Before pushing, search the build output for real client names and check each new image
  by eye.
