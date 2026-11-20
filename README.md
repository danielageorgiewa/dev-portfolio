# danielageorgieva.work

Daniela Georgieva's portfolio: a home page, three case studies and a CV, each in English and
Bulgarian. It is a static [Astro](https://astro.build) site with plain CSS, hosted on Netlify.
The only server code is two small Netlify functions behind the "Book this time" widget in
the Contact section. They read free time from a Google Calendar and create the call.

Netlify publishes the `main` branch to https://danielageorgieva.work. **Every push to `main`
goes live.**

- [Running locally](#running-locally)
- [Environment variables](#environment-variables)
- [How booking works](#how-booking-works)
- [Google setup](#google-setup)
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

It works without logging in or linking the site. It reads `.env` if there is one. Without
the Google variables the functions answer "not configured" and the page falls back to the
email link, the same as in production.

Notes:

- The root URL `/` redirects by browser language on Netlify (Bulgarian to `/bg/`, everything
  else to `/en/`). That rule is in `netlify.toml`. Under `npm run dev` and `npm run preview`
  the root is a small page that forwards to `/en/`.
- To screenshot a page for comparison with Figma:
  `node scripts/shot.mjs <url> <width> <out.png> [--no-js] [--reduced-motion]`.

## Environment variables

Only booking needs them. The names are listed in `.env.example`.

| Name | What it is |
| --- | --- |
| `GOOGLE_CLIENT_ID` | OAuth client ID from Google Cloud |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret from the same client |
| `GOOGLE_REFRESH_TOKEN` | Long-lived token from `scripts/google-auth.mjs` |
| `GOOGLE_CALENDAR_ID` | The calendar to read and book into. For the main calendar of a Google account this is the account's email address |
| `GOOGLE_NOTIFY_EMAIL` | Optional. One fixed address that Google emails about each new call request. See "How booking works" |

In production they live in Netlify: **Site configuration > Environment variables**, set up
as described in step 7 of "Google setup". For local work copy `.env.example` to `.env` and
fill it in. `.env` is git-ignored. Never commit real values and never paste them into an
issue, a chat or a screenshot.

The first four must be set. If any is missing the site still works: the booking widget stays
hidden and visitors get the email link. `GOOGLE_NOTIFY_EMAIL` can stay empty.

## How booking works

- `GET /api/availability` (`netlify/functions/availability.ts`) asks Google Calendar which
  times are busy and returns up to six free 30-minute slots as UTC start times, nothing
  else. Slots are Monday to Friday, 11:00 to 16:00 Sofia time (the last one starts at
  15:30), within the next seven days, and at least two hours from now. Clock changes are
  handled. The answer is cached for one minute. A request with a query string gets a 400.
- `POST /api/book` (`netlify/functions/book.ts`) takes the chosen slot, a name, an email and
  a short message. It checks every field, checks that the slot is one the site could offer,
  asks the calendar again whether that half hour is still free, and then puts a call
  request on the calendar.
- The page (`src/scripts/booking.ts`) shows the slots in the visitor's own time zone. If the
  functions are not configured, fail or take more than five seconds, the widget stays out
  of the way and the email link is shown.
- Protection: requests must come from the site itself, the body is limited to 10 kB, a
  hidden field catches simple bots, and Netlify rate limits both functions per visitor
  (the `config.rateLimit` block in each function file). Names, emails and messages are never
  written to the logs.

### What a request looks like, and who gets an email

The site never makes Google send an email to an address a visitor typed.

1. A visitor's request lands on the calendar as a **tentative** event called
   "Call request: (their name)". Their name, email and message are in the event's notes. A
   Google Meet link is already attached. The visitor is not a guest on the event.
2. Nobody outside gets an email from the Google account at this point.
3. When you want the call, open the event, add the visitor's email as a guest and save.
   Google then sends them the invite with the Meet link. If you do not want it, delete the
   event.

Google does not email you about events created on your own calendar, so there are two ways
to hear about a new request:

- Set `GOOGLE_NOTIFY_EMAIL` to an address you read. The function adds that one address as
  the only guest and Google emails it for every request. This works only when the address
  is different from the Google account that owns the calendar, because Google does not
  notify an organiser about her own event. Running bookings from a dedicated Google account
  (see "Google setup") makes it work: the dedicated account creates the event and your
  everyday address gets the email.
- Leave it empty. Then no email is sent to anyone, and you need to check the calendar for
  new tentative events yourself.

### Limits

- **One event per slot.** Each slot has a fixed event ID, and Google refuses a second event
  with the same ID. If two people submit the same slot at the same moment, one gets it and
  the other is told the time was just taken.
- **A cancelled slot stays closed.** Google keeps the ID of a deleted event, so a slot whose
  request you deleted cannot be requested again through the site, and the site stops
  offering it. To use that time after all, create the event by hand.
- **Caps.** At most 8 upcoming requests in total, at most 4 new requests in any 24 hours,
  and at most 1 upcoming request per email address. Over a cap, the visitor is shown the
  email link. The three numbers are constants at the top of
  `netlify/functions/_lib/book-handler.ts`. Only events the site created are counted. The
  email address is stored on the event as a short hash for this count.
- **Text rules.** The name may contain letters in any alphabet, spaces, dots, apostrophes
  and hyphens. A name or message that contains a link (`http:`, `www.`, `://`, or a domain
  followed by a slash) is refused, and so are invisible zero-width characters.

The working hours, slot length, look-ahead and lead time are constants at the top of
`netlify/functions/_lib/slots.ts`.

## Google setup

Do this once, after the site is live. It takes about fifteen minutes. Use the Google account
whose calendar should receive the bookings.

**Which account and calendar.** Be clear about what the site's token can do. The
`calendar.events` permission is not limited to seeing busy times: it can read, change and
delete events on every calendar that account can edit. If the token leaked, that is what
someone else could do. So keep what it can reach small:

- Best: a dedicated Google account used only for bookings. It has nothing private in it,
  and it also makes `GOOGLE_NOTIFY_EMAIL` work (see "How booking works").
- At least: a dedicated calendar for bookings inside your account (Google Calendar, **Other
  calendars > + > Create new calendar**), with its ID as `GOOGLE_CALENDAR_ID`. This keeps
  requests apart from your own events, but the token can still reach your other calendars.

The price of either choice: the site only looks at the one calendar in `GOOGLE_CALENDAR_ID`
when it works out free time. Appointments on your everyday calendar do not block slots
unless they are also on the booking calendar, so block busy times there, or decline the
requests that clash.

### 1. Create a Google Cloud project

1. Open https://console.cloud.google.com and sign in.
2. Open the project menu at the top, choose **New project**, give it a name (for example
   "Portfolio booking") and create it. Make sure it is the selected project for the steps
   below.

### 2. Enable the Calendar API

1. Go to **APIs & Services > Library**.
2. Search for "Google Calendar API", open it and press **Enable**.

### 3. Set up the consent screen

Go to **APIs & Services > OAuth consent screen**. Newer versions of the console call this
area **Google Auth Platform** and split it into Branding, Audience and Data Access. The
settings are the same.

1. App name: anything you will recognise. Support email and developer contact: your own.
2. Audience (user type):
   - With a normal Gmail account, choose **External**.
   - With a Google Workspace account you can choose **Internal**. Then skip step 4 below.
3. Scopes (Data Access): add these two.
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/calendar.freebusy`
4. **Publish the app.** On the Audience page press **Publish app** so the publishing status
   is **In production**. This matters: while the status is **Testing**, Google cancels
   refresh tokens after 7 days and booking would stop working a week after setup. You do
   not need to send the app for verification. Only you will ever sign in to it. The price
   of skipping verification is a warning page during sign-in (step 6).

### 4. Create the OAuth client

1. Go to **APIs & Services > Credentials** (or **Google Auth Platform > Clients**).
2. **Create credentials > OAuth client ID**.
3. Application type: **Web application**.
4. Under **Authorised redirect URIs** add exactly:

   ```
   http://127.0.0.1:53682/oauth2callback
   ```

5. Create it. Copy the **Client ID** and the **Client secret**.

### 5. Put the two values in `.env`

```
cp .env.example .env
```

Open `.env` and fill in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Set
`GOOGLE_CALENDAR_ID` to the calendar's ID. For your main calendar that is your Google
account's email address. For another calendar, open Google Calendar, then the calendar's
**Settings and sharing**, and copy **Calendar ID** from the "Integrate calendar" section.

### 6. Sign in once to get the refresh token

```
node scripts/google-auth.mjs
```

The script opens Google's sign-in page in your browser. Choose the account that owns the
calendar. Because the app is not verified, Google shows "Google hasn't verified this app":
press **Advanced**, then **Go to (your app name)**, then allow both calendar permissions.
The browser tab says "Signed in" and the terminal prints the refresh token.

- The token is only printed. To also save it to your local `.env`, run
  `node scripts/google-auth.mjs --write-env`.
- If port 53682 is taken, run `node scripts/google-auth.mjs --port 5000` and add
  `http://127.0.0.1:5000/oauth2callback` to the client's redirect URIs first.
- Treat the refresh token like a password. Whoever has it, together with the client secret,
  can read, change and delete events on that account's calendars.
- With `--write-env` the script also sets `.env` so that only your user can read it.

### 7. Set the four variables in Netlify

This repository is public. Anyone can fork it and open a pull request, and a build of that
pull request must never receive these values. Set them up like this:

1. In Netlify open the site, then **Site configuration > Environment variables**, and add
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` and
   `GOOGLE_CALENDAR_ID` (and `GOOGLE_NOTIFY_EMAIL` if you use it).
2. For each one, under **Scopes** choose specific scopes and tick **Functions** only. Leave
   Builds, Runtime and Post processing unticked. The build does not need them. (If your
   Netlify plan does not offer scopes, steps 3 to 5 still apply and matter most.)
3. For each one, under **Deploy contexts** choose a different value for each context and
   fill in **Production** only. Leave Deploy Previews, Branch deploys and Local development
   empty.
4. Tick **Contains secret values** for `GOOGLE_CLIENT_SECRET` and `GOOGLE_REFRESH_TOKEN`.
   Netlify then hides the values after saving and keeps them out of builds of untrusted
   pull requests.
5. Under **Site configuration > Build & deploy > Deploy Previews**, either turn Deploy
   Previews off (this project does not use pull requests), or keep the setting that
   requires your approval before a pull request from a fork is built. Never approve a
   pull request you have not read.

Menu names in Netlify change from time to time. What has to be true at the end: all the
variables exist for Production and for Functions only, the two secrets are marked secret,
and no deploy preview from a fork can run without you.

### 8. Redeploy

Environment variables only reach the functions on a new deploy. In Netlify go to
**Deploys > Trigger deploy > Deploy site**, or push a commit.

### 9. Test it

1. Open https://danielageorgieva.work/api/availability. You should see
   `{"slots":["2026-...Z", ...]}`. If you see `{"configured":false}`, a variable is missing
   or the site was not redeployed. If you see `{"ok":false}`, Google refused the request:
   open **Logs > Functions** in Netlify. The log line names the step that failed
   (`token`, `freebusy`, `list` or `insert`) and Google's status code. `token 400` or `401` means
   the refresh token or the client values are wrong. `freebusy 404` means the calendar ID
   is wrong.
2. Put a test event in your calendar inside the working hours, wait a minute (the answer
   is cached for 60 seconds) and reload. That time should be gone from the list.
3. Open the site, scroll to the Contact section, pick a time and book it with an email
   address you can read. Check that a tentative "Call request" event is in the calendar
   with a Meet link and the details in its notes, that the visitor address received
   nothing, and that `GOOGLE_NOTIFY_EMAIL` (if set) received an email. Then add the visitor
   address as a guest, save, and check that the invite arrives with the Meet link.
   Deleting the test event closes that slot for good (see "Limits"), so test with a time
   you do not need.
4. Locally, the same check works with `npx netlify dev` once `.env` has all four values.

If booking ever stops working, visitors see the email link, so nothing breaks in public.
The usual cause is a cancelled refresh token (the app was put back into Testing, or access
was removed in your Google account). Run step 6 again and update `GOOGLE_REFRESH_TOKEN` in
Netlify.

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
