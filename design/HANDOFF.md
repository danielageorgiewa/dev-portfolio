# Handoff: Daniela Georgieva — developer portfolio

## Overview

A single-page bilingual (English / Bulgarian) portfolio for a full stack developer. One
scrolling page: full-bleed hero with portrait, about + education + languages, three
project case studies with interactive screenshot previews, a tech stack grid, and a
contact section with a time-slot picker that hands off to Google Calendar.

Two designs are provided:

- **`design/Portfolio Atelier.dc.html`** — desktop / tablet
- **`design/Portfolio Atelier Mobile.dc.html`** — phone (designed at 430 × 900)

They are two separate design files, not one responsive document. Implement as a single
responsive page: the mobile file is the authority for phone breakpoints, the desktop file
for everything above roughly 900px.

## About the Design Files

The files in this bundle are **design references created in HTML** — prototypes showing
intended look and behaviour, not production code to copy directly. They are authored in a
proprietary template runtime (`<x-dc>`, `{{ holes }}`, `<sc-for>`, `<sc-if>`, and a
`Component extends DCLogic` class). **Do not try to ship or port that runtime.**

The task is to **recreate these designs in the target codebase's environment** using its
established patterns and libraries. If no codebase exists yet, Next.js (App Router) with
Tailwind is a natural fit — it matches the stack the portfolio itself advertises. Reading
the design files:

- `<sc-for list="{{ x }}" as="item">` → a `.map()` over `x`
- `<sc-if value="{{ flag }}">` → a conditional render
- `{{ t.someKey }}` → a lookup in the active language dictionary
- `style-hover="…"` → a `:hover` rule with those declarations
- `renderVals()` → the values the markup consumes; everything computed lives there

The `COPY` object near the top of each `<script type="text/x-dc">` block holds **all
final copy in both languages**. Lift it verbatim — see *Content & i18n* below.

## Fidelity

**High-fidelity.** Colours, typography, spacing, easing and interaction behaviour are all
final and should be reproduced faithfully. Exact values are in *Design Tokens*.

---

## Screens / Views

The page is one continuous scroll. Sections in order:

### 1. Language toggle (fixed, all viewports)

- Fixed `top:16px; right:24px`, `z-index:80`. Mobile: `top:12px; right:16px`.
- Pill container: `padding:4px`, `border-radius:999px`,
  `background:rgba(246,243,238,.86)`, `backdrop-filter:blur(14px)`,
  `border:1px solid #ded8d3`, `box-shadow:0 4px 16px rgba(46,37,35,.07)`.
- Two options, `EN` and `БГ`: `padding:7px 15px`, `font-size:12px`,
  `letter-spacing:.08em`, `border-radius:999px`.
- Active: `background:#2e2523`, `color:#f2f0ed`. Inactive: `color:#716660`, no fill,
  hover to `#2e2523`.
- Both options carry the sheen hover (see *Interactions*).

### 2. Sticky header (desktop)

- Fixed full width, `z-index:60`, `padding:18px 46px`,
  `background:rgba(246,243,238,.74)`, `backdrop-filter:blur(16px)`.
- **Hidden at the top of the page.** Starts `opacity:0; transform:translateY(-8px)` and
  fades in only after the hero is scrolled past (see *Interactions*).
- Left: 28px circular portrait thumbnail + name in Instrument Serif italic, 20px.
- Right: nav links `Work · Stack · About` (13.5px, `#716660`) then `Book a call`
  (`#2e2523`, `border-bottom:1px solid #a8877c`). Nav has `padding-right:112px` so it
  clears the language toggle.
- Mobile header: same behaviour, `padding:13px 20px`, name only, no nav and **no
  hamburger** — the nav was cut deliberately on phone.

### 3. Hero (full-bleed)

- `min-height:100vh`, `position:sticky; top:0`, centred column,
  `padding:80px 34px 96px`. Mobile: `padding:96px 24px 120px`.
- Two background layers behind the content:
  1. **Blush**: circle `width:min(88vw,1000px)`, `aspect-ratio:1`, centred,
     `background:radial-gradient(circle at 42% 38%, rgba(168,135,124,.4), rgba(168,135,124,0) 70%)`,
     `filter:blur(24px)`. Scales with scroll (see *Interactions*).
  2. **Dot grid**: `opacity:.5`,
     `background-image:radial-gradient(rgba(46,37,35,.09) 1px, transparent 1px)`,
     `background-size:5px 5px`.
- **Portrait**: 132px circle (mobile 108px), `overflow:hidden`,
  `box-shadow:0 0 0 2px rgba(168,135,124,.65), 0 16px 38px rgba(46,37,35,.12)`.
  The ring is a shadow, not a border — a thick border was explicitly rejected.
  Image `object-fit:cover; object-position:50% 20%`.
- **Eyebrow**: 12px, `letter-spacing:.28em`, uppercase, `#8a7f79`.
- **Name**: Instrument Serif 400, `font-size:clamp(52px,8.2vw,118px)`, `line-height:1`,
  `letter-spacing:-.022em`. First name roman, surname *italic*, on separate lines.
- **Bio**: 18px, `line-height:1.7`, weight 300, `#5f5450`, `max-width:52ch`.
- **CTAs**, `gap:11px`: primary pill (`background:#2e2523`, `color:#f2f0ed`,
  `padding:15px 28px`, `border-radius:999px`, 14.5px/500) and secondary outline pill
  (`border:1px solid #d7d1cb`, `color:#423a36`).
- **Meta row**: three items, 12px, `letter-spacing:.16em`, uppercase, `#a29790`,
  `gap:28px`.
- **Scroll cue**: bottom centre, label plus a 1px × 34px
  `linear-gradient(#bdb4ad,transparent)` rule.

### 4. About + education + languages

- `id="about"`, `background:#f2f0ed`, `padding:120px 46px 40px`, `scroll-margin-top:88px`.
- Grid `1.15fr .85fr`, `gap:80px`, `max-width:1180px`. Mobile: single column.
- Left: kicker (12px, `letter-spacing:.26em`, uppercase, `#a29790`), then lead line in
  Instrument Serif `clamp(26px,2.9vw,40px)`, `line-height:1.34`, then body 16.5px weight
  300 `#5f5450`, `max-width:54ch`.
- Right: education entries — title Instrument Serif 25px, sub 14.5px weight 300 `#716660`.
- Below education, separated by `padding-top:26px; border-top:1px solid #ded8d3`: the
  **Languages** block. Each row is `display:flex; justify-content:space-between;
  align-items:baseline`, name in Instrument Serif 21px, level 14px weight 300 `#716660`
  right-aligned.

### 5. Selected work

- `id="work"`, `padding:70px 46px 40px`, `scroll-margin-top:88px`.
- Header row: `h2` Instrument Serif 44px (first word italic) on the left, count label
  (12px, `letter-spacing:.2em`, uppercase, `#a29790`) on the right, separated by
  `padding-bottom:22px; border-bottom:1px solid #ded8d3`.
- Three project rows, each a two-column grid that **alternates side** — even rows put the
  visual left, odd rows right (`flip = i % 2 === 1`). Mobile stacks, visual always first.
- Text column per project:
  - Kind label: 12px, `letter-spacing:.24em`, uppercase, `#a29790`
  - Name: `h3`, Instrument Serif, `clamp(32px,3.6vw,50px)`, `letter-spacing:-.015em`
  - `what`: 16.5px, weight 300, `#5f5450`, `max-width:42ch`
  - `built`: 15.5px, weight 300, `#7b7069`
  - `note` (first two projects only): Instrument Serif **italic** 15px, `#a29790` — the
    disclaimer that brand names and copy have been substituted
  - Tag pills: `padding:7px 14px`, `border-radius:999px`, `border:1px solid #d7d1cb`,
    12.5px, `#5f5450`, `gap:8px`, wrapping
- Visual column per project — three different treatments:
  - **Multi-brand platform**: tabbed **live preview**. Three tabs (`Homepage`, `Product`,
    `Account`) above a bordered viewport. Each tab is a scaled iframe of the mock pages in
    `design/Trade Portal - *.html`, authored at 1440px wide and scaled down to fit the
    column, capped at 430px tall (mobile 380px).
  - **B2B trade portal**: tabbed **static screenshots** (`assets/b2b-homepage.png` 1482 ×
    870, `assets/b2b-signin.png` 520 × 824 at 2×). Two tabs, `Homepage` and `Sign in`.
    Deliberately *not* iframes — live frames re-rendered visibly on tab switch.
  - **OurMoney**: two overlapping phone screenshots
    (`assets/ourmoney-dashboard.png`, `assets/ourmoney-goals.png`), each `width:47%`,
    `border-radius:20px`, `border:1px solid #ded8d3`,
    `box-shadow:0 14px 34px rgba(46,37,35,.12)`; the second offset `margin-top:34px`.
  - Tabs: 12px, `letter-spacing:.16em`, uppercase, `#5f5450`, `gap:18px`; the active tab
    has a 1px `#a8877c` underline.
  - **Sizing rule that matters**: the bordered frame must hug the *active* image's aspect
    ratio — never a fixed box. Use `aspect-ratio: w / h` plus
    `width: min(100%, w * maxH / h)`. Letterboxing / matting inside the border was
    rejected repeatedly, as was a fixed-height box that left dead space under the wide
    screenshot.

### 6. Tech stack

- `id="stack"`, `background:#e9e6e2` (the page's only second background),
  `padding:100px 46px`, `scroll-margin-top:88px`.
- Header: kicker + `h2` Instrument Serif `clamp(30px,3.6vw,48px)` left, note paragraph
  (15.5px, weight 300, `#716660`, `max-width:40ch`) right.
- Three cards, `grid-template-columns:repeat(3,1fr)`, `gap:26px`. Mobile: one column.
- Card: `background:#f2f0ed`, `border:1px solid #ded8d3`, `border-radius:6px`,
  `padding:30px`. Title Instrument Serif *italic* 26px above
  `padding-bottom:18px; border-bottom:1px solid #e3ddd8`.
- Items: one per row, `padding:11px 0`, `border-bottom:1px solid #ece8e4`.

### 7. Contact + calendar

- `id="contact"`, `padding:120px 46px 90px`, centred, `max-width:820px`,
  `scroll-margin-top:88px`. A soft blush radial sits behind, same colour as the hero's at
  `.26` alpha.
- Availability chip: `border:1px solid #dbd5cf`, `border-radius:999px`,
  `padding:7px 15px 7px 12px`, 12.5px, with a 6px `#a8877c` dot.
- `h2`: Instrument Serif `clamp(42px,6.2vw,88px)`, `line-height:1.03`, second line italic.
- Sub-line: 17px weight 300, `max-width:42ch`, with one word emphasised in Instrument
  Serif italic at `1.16em`.
- **Slot picker**: `grid-template-columns:repeat(3,1fr)`, `gap:10px`, `max-width:540px`.
  Each slot `padding:13px 8px`, `border-radius:999px`, 13.5px, centred.
  Unselected: `background:#e9e6e2`, `border:1px solid #ded8d3`, `color:#5f5450`.
  Selected: `background:#2e2523`, `color:#f2f0ed`.
- Below: the selected slot echoed as text (13.5px, `#8a7f79`) beside the confirm button,
  which is the primary dark pill linking to Google Calendar.
- Footer row: social links + location, `gap:26px`, 13px, `#8a7f79`,
  `padding-top:26px; border-top:1px solid #ded8d3`. Each link has a `↗` glyph at 11px and
  a transparent bottom border that becomes `#a8877c` on hover.

### 8. Mobile-only: pinned booking bar

- `position:fixed; bottom:0`, centred, `max-width:440px`, `z-index:58`,
  `padding:12px 20px 20px`,
  `background:linear-gradient(rgba(246,243,238,0), rgba(246,243,238,.94) 40%)`,
  `backdrop-filter:blur(10px)`.
- Hidden until the hero is scrolled past; fades and slides in from `translateY(16px)`.
- **Its behaviour changes with state**: while no slot is selected it reads *Book a
  30-minute call* and scrolls to `#contact`; once a slot is picked it reads
  *Continue · <slot>* and links out to Google Calendar.

---

## Interactions & Behavior

### Language switching

- Two dictionaries, `en` and `bg`. Switching sets the language after a **260ms crossfade**:
  every translated block carries `transition:opacity .26s ease, filter .26s ease` and goes
  to `opacity:.22; filter:blur(1.5px)` mid-swap, then back to `opacity:1; filter:none`.
- The hero animates too — the swap briefly enables transitions on hero elements that are
  otherwise driven directly by scroll.
- **Switching language clears any selected time slot**, so a slot label from one language
  can never sit against the other language's grid.
- Bulgarian is a full translation, including project copy, slot day names (`ср/чт/пт`) and
  the calendar CTA. Bulgarian strings are noticeably longer — layout must tolerate roughly
  20% more text without reflowing badly.

### Scroll behaviour

- **Hero parallax**, driven directly from a passive `scroll` listener (not CSS):
  hero content translates up and fades out as it leaves; the blush circle scales from
  `.5` upward. Written to the DOM in the handler with transitions off, so it tracks the
  scrollbar exactly.
- Header and mobile booking bar reveal once the hero is mostly out of view.
- **Section reveals**: every `[data-rv]` element starts `opacity:0;
  transform:translateY(22–24px)` and animates to rest on entering the viewport via
  `IntersectionObserver` at `threshold:0.14`, transition `opacity .9s ease, transform .9s
  ease`, some with a `.12s` stagger. Each element unobserves after firing — reveals do not
  replay.
- **In-page navigation must be driven from JS, not bare hash links.** Compute the target's
  offset, subtract the sticky-header height (76px desktop, 64px mobile) and call
  `scrollTo({ behavior: 'smooth' })`; honour `prefers-reduced-motion` with `'auto'`. In a
  plain web app hash links plus `scroll-margin-top` would be fine, but the design was
  authored inside a host that swallows hash navigation, hence the explicit handler.

### Sheen hover

The signature hover: a diagonal highlight sweeps across the element.

```css
/* resting state */
background-image: linear-gradient(100deg,
  rgba(255,255,255,0) 32%, rgba(255,255,255,.98) 50%, rgba(255,255,255,0) 68%);
background-size: 260% 100%;
background-repeat: no-repeat;
background-position: 140% 0;
transition: background-position .72s cubic-bezier(.3,.7,.4,1);

/* hover */
background-position: -60% 0;
```

On **dark** surfaces (primary CTA, active language pill, selected slot) the mid-stop alpha
drops from `.98` to `.30` so it reads as a highlight rather than a wash.

Applied to: nav links, the book-a-call link, hero CTAs, language toggle pills, tech stack
cards, project tag pills and calendar slots. Most of these are not clickable — the sheen is
decorative polish and that was intentional.

Accompanying hover states:

- Nav links: `color` → `#2e2523` plus `box-shadow: inset 0 -1px 0 #a8877c` as the underline
- Tag pills and slots: `transform: translateY(-2px)`, border warms to `#a8877c`
- Primary CTA: `translateY(-2px)`, `box-shadow: 0 10px 26px rgba(46,37,35,.24)`
- Stack cards: border → `#c9bfb7`

### Project preview tabs

- All tab targets are **mounted at once and crossfaded** (`transition:opacity .42s ease`),
  not swapped by changing a `src`. Swapping the source caused a visible load-and-resize.
- 420ms is deliberate; a faster fade felt abrupt.

### Reduced motion

`@media (prefers-reduced-motion: reduce)` disables animations, and scroll jumps fall back
to instant.

---

## State Management

| State | Type | Purpose |
| --- | --- | --- |
| `lang` | `'en' \| 'bg'` | Active language |
| `fading` | boolean | True during the 260ms language crossfade |
| `slot` | string \| null | Selected time slot label; **reset to null on language change** |
| `frames` | `{ [projectKey]: number }` | Active preview tab per project |
| `portalW` | `{ [projectKey]: number }` | Measured column width per preview, via `ResizeObserver`, used to compute preview scale |

No data fetching. Everything is static content in the language dictionaries. Persisting
`lang` (localStorage or a locale route segment) would be a sensible production addition.

---

## Design Tokens

### Colours

| Token | Hex | Use |
| --- | --- | --- |
| Page background | `#f2f0ed` | Body, hero, about, work, contact |
| Alt background | `#e9e6e2` | Tech stack section, unselected slots |
| Ink | `#2e2523` | Primary text, dark buttons |
| Ink on dark | `#f2f0ed` | Text on dark buttons |
| Body text | `#5f5450` | Bio, paragraphs |
| Body text, softer | `#7b7069` | Project `built` line |
| Muted | `#716660` | Nav, secondary detail |
| Muted, lighter | `#8a7f79` | Eyebrow, footer links |
| Faint | `#a29790` | Kickers, meta rows, italic notes |
| Accent | `#a8877c` | Underlines, dots, blush, hover borders |
| Accent tint | `#e0cfc9` | Text selection |
| Border | `#ded8d3` | Section rules, cards, frames |
| Border, warm | `#d7d1cb` | Outline buttons, tag pills |
| Border, faint | `#e3ddd8` / `#ece8e4` | Card internals |
| Border, hover | `#c9bfb7` | Stack card hover |
| Glass | `rgba(246,243,238,.74–.86)` | Header, toggle, booking bar |

### Typography

- **Display**: Instrument Serif, 400, roman and italic — name, section headings, project
  titles, education, language names, italic notes
- **Body**: Inter Tight, 300 / 400 / 500 — everything else
- Both from Google Fonts:
  `Instrument+Serif:ital@0;1` and `Inter+Tight:wght@300;400;500`
- Scale: hero `clamp(52px,8.2vw,118px)` · contact h2 `clamp(42px,6.2vw,88px)` · project
  title `clamp(32px,3.6vw,50px)` · work h2 `44px` · stack h2 `clamp(30px,3.6vw,48px)` ·
  about lead `clamp(26px,2.9vw,40px)` · card title `26px` · education `25px` · language
  `21px` · bio `18px` · contact sub `17px` · body `16.5px` · `built` / stack note `15.5px`
  · CTA `14.5px` · education sub / language level `14px` · nav / slots `13.5px` · footer
  `13px` · tags `12.5px` · kickers `12px` · scroll cue `11px`
- Kickers: `letter-spacing:.26em`, uppercase. Meta: `.16em`. Eyebrow: `.28em`.
  Project kind: `.24em`. Display headings: negative tracking, `-.01em` to `-.022em`.
- `text-wrap: pretty` on every multi-line paragraph.

### Spacing, radius, shadow

- Section padding: `100–120px` vertical desktop, `46px` horizontal (mobile `24px`)
- Content max-width: `1180px`; contact column `820px`; mobile shell `440px`
- Radius: `999px` pills · `20px` phone screenshots · `10px` preview frames · `6px` cards
  · `50%` portraits
- Shadows: portrait ring `0 0 0 2px rgba(168,135,124,.65), 0 16px 38px rgba(46,37,35,.12)`
  · preview frame `0 16px 38px rgba(46,37,35,.12)` · phone shots
  `0 14px 34px rgba(46,37,35,.12)` · CTA hover `0 10px 26px rgba(46,37,35,.24)` · toggle
  `0 4px 16px rgba(46,37,35,.07)`
- Easing: `cubic-bezier(.22,.61,.36,1)` for lifts, `cubic-bezier(.3,.7,.4,1)` for the
  sheen sweep, `ease` for fades. Durations: `.2–.26s` micro, `.42s` preview crossfade,
  `.72s` sheen, `.9s` section reveal.

---

## Content & i18n

All copy is final and **must be carried over verbatim** — it went through many rounds of
revision, in both languages. Lift the `COPY` object from the design file rather than
retyping.

Notes:

- Tone: human and professional, first person, no LinkedIn register. Avoid framing projects
  around "replacing legacy systems".
- The Bulgarian is a real translation, not a mirror of the English phrasing — it was tuned
  by ear. Do not regenerate it from the English.
- Both the B2B and multi-brand projects carry an italic note stating that brand names and
  product copy have been substituted. **Keep it.** Preserving client confidentiality was
  the reason for the substitution.

### External links

- Google Calendar booking: `https://calendar.app.google/44Wm5fa65HyQirNQA`
- GitHub: `https://github.com/danielageorgiewa`
- LinkedIn: `https://bg.linkedin.com/in/daniela-georgieva-0753013a3`

The slot picker is presentational — picking a slot updates the label, then the CTA hands
off to the Google Calendar booking page. If you want real slot booking, that needs the
Calendar API and a backend; the design does not assume it.

---

## Assets

In `design/assets/`:

| File | Notes |
| --- | --- |
| `daniela.jpg` | Portrait. Used at 132px (hero), 108px (mobile hero), 28px (header). `object-position:50% 20%` |
| `ourmoney-dashboard.png`, `ourmoney-goals.png` | OurMoney app screenshots, real product |
| `b2b-homepage.png` (1482 × 870), `b2b-signin.png` (520 × 824) | 2× captures of the B2B mock pages, used as static previews |
| `b2b-hero.png`, `b2b-auth-bg.png` | Photography used inside the B2B mock pages |

Photography inside the mock portal pages is royalty-free stock (Unsplash / Pexels).

### The mock portal pages

`design/Trade Portal - *.html` and `design/B2B Portal - *.html` are **standalone mockups
built for the portfolio previews** — a stand-in for the real client work, with brand names
and product copy substituted. All figures in them (prices, U-values, warranties, review
quotes and names, company registration and VAT numbers) are invented placeholders, by
design. They are not client data and are not meant to be accurate. Company number and VAT
are written as obvious zeros to make that unmistakable.

They only need to be faithful enough to read as real screenshots at preview scale. If the
real client sites can be screenshotted with permission, swapping these out is the cleaner
long-term answer.

---

## Files

```
design/
  Portfolio Atelier.dc.html          desktop design — start here
  Portfolio Atelier Mobile.dc.html   phone design
  support.js                         template runtime (do NOT port)
  Trade Portal - Homepage.html       retail mock, live-iframe preview
  Trade Portal - Product.html
  Trade Portal - Account.html
  B2B Portal - Homepage.html         B2B mock, source of the static screenshots
  B2B Portal - Sign in.html
  assets/                            portrait, app screenshots, preview captures
```

Open either `.dc.html` in a browser to see the design running, including hover states,
language switching, scroll reveals and the preview tabs.

## Suggested build order

1. Tokens, fonts, page shell, the two backgrounds
2. Hero — static first, then the scroll parallax
3. Language dictionaries and the toggle, with the crossfade
4. About / education / languages, then the reveal observer
5. Work section, alternating rows, then the preview components
6. Tech stack, contact, slot picker
7. Sheen hover pass, mobile pinned bar, reduced-motion audit
