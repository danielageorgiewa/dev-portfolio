# Case study template

One route, `src/pages/[lang]/work/[slug].astro`, renders all three case studies in both
languages. A study is its copy plus, optionally, a few components of its own.

Sections, in the order of the Figma frames: Intro, Screens, Where it started, What changed,
(study extra), Results, How it is built, Next, Footer.

## Adding a study

1. Write `src/content/case/<slug>.en.ts` and `<slug>.bg.ts`, each exporting a `CaseContent`
   (type in `src/content/case.ts`). Copy every string from Figma character for character;
   mark anything that is not in Figma (alt text, accessible names) with a comment.
2. Register both in the `studies` map in `src/content/case.ts`. `getStaticPaths` then builds
   `/en/work/<slug>` and `/bg/work/<slug>`.
3. If the study has its own Screens section, change-card vignettes or an extra section, put the
   components in `src/components/case/<study>/` and register them in `studyParts` in the route:

   ```ts
   'language-school-website': { Screens: SchoolScreens, Vignette: SchoolVignette, AfterChanges: Editor },
   ```

   | Part | Rendered | Props |
   | --- | --- | --- |
   | `Screens` | under the intro | `{ lang, t: CaseContent['screens'] }` |
   | `Vignette` | at the top of every change card | `{ vignette: CaseVignette }` |
   | `AfterChanges` | between "What changed" and "Results" | `{ lang, t: CaseContent }` |

   All three are optional. Without `Screens` the section is skipped; without `Vignette` the
   cards have no drawing.
4. Screenshots go in `src/assets/case/<study>/`, exported whole from the Figma composite frame
   (never a bare "Base", never `rawImages`, never anything from `captures/`).

## Content model (`src/content/case.ts`)

`CaseContent`: `slug`, `author` (name used after the heading in `<title>`), then one object
per section:

- `intro`: `back`, `kicker`, `title` (italic tail in `<em>`; also the page `<title>`),
  `lead` (also the meta description), `facts[]` of `{ key, value? , chips? }`.
- `screens`: `tabs[]` of `{ id, label }`, `caption`, and the functional strings
  `tablistLabel`, `alt` (by tab id), `openLabel` (unused while every screen is in a frame) and
  `frame`: `{ expand, shrink, scroll? }`, the button labels of the expandable frame and the
  accessible name of the box a screenshot scrolls in.
- `started`: `kicker`, `heading`, `text`, `foundKicker`, `rows[]` of `{ value, label }`.
- `changes`: `kicker`, `heading`, `cards[]` of `{ number, title, text, vignette }` where
  `vignette` is `{ kind, labels }`: `kind` picks the drawing, `labels` are the words in it.
- `results`: `kicker`, `heading`, `numbers[]` of `{ value, label }`. Optional `metrics[]` of
  `{ label, value }` (a two-column list under the numbers; language school).
- `editor` (optional, language school): `kicker`, `heading`, `text`, `alt`, `openLabel`.
- `intro.leadWidth` (optional): measure of the lead in px when a line that only just fits in
  the browser has to break as in Figma. `screens.compare` (optional): the slider's strings.
- `built`: `kicker`, `heading`, `steps[]` of `{ number, title, text }`.
- Optional, added for the warehouse study: `results.method` (small line under the numbers),
  `results.tone` (band colour as a token name, e.g. `'project-sis'`; default `text-ink`),
  `steps[].wrap` (a step title Figma sets on two lines).
- `next`: `kicker`, `title` (the next study's title as the band shows it).
- `footer`: `left`, `right` (the footnote about placeholder client names).

Helpers: `getCase(lang, slug)`, `caseSlugs()`, `nextCaseSlug(slug)`, `getCaseStaticPaths()`,
`plainText(html)`. A study that needs more fields adds optional ones to the type.

## Components

| Component | Props | Notes |
| --- | --- | --- |
| `Intro.astro` | `lang`, `t: intro` | `h1`, lead, facts (`dl`). The back link shows on phone only; on desktop Figma has it in the header. |
| `Screens.astro` | `t: screens` | Tabs over framed panels. Fill one named slot per tab id. Tabs hide when there is one. |
| `EmbedFrame.astro` | `frame {width,height}`, `phoneFrame`, `labels {expand,shrink}`, `content?`, `phoneContent?`, `maxHeight?`, `noJs?` | The expandable, scrolling frame around every embedded screen (below). Script in `src/scripts/case-embed.ts`. |
| `ScreenShot.astro` | `shot {src,width,height}`, `phone?`, `alt`, `frame?`, `maxHeight?`, `openLabel?`, `loading?` | With `frame`: the image in an `EmbedFrame`; `width` × `height` is the expanded frame and a taller image scrolls in it. Without `frame`: the picture linked to the full-size image (the editor still). `phone` swaps in below 768px. |
| `Started.astro` | `t: started` | Two columns, stacked on phone. |
| `Changes.astro` | `t: changes`, `Vignette?` | Card grid. Sets the `--v` unit for vignettes. |
| `Results.astro` | `t: results` | Dark band. Column count follows `numbers.length`. |
| `Built.astro` | `t: built` | Flow of steps; arrows turn down below 1024px. |
| `Next.astro` | `t: next`, `href` | The band is one link. Round button, as drawn. |
| `CaseFooter.astro` | `lang`, `t: footer` | Case study footer with the footnote. The route passes `footer={false}` to Base. |
| `multi-shop/Screens.astro` | `lang`, `t: screens` | Homepage and Product full-page captures in frames, and the Custom size demo. |
| `multi-shop/CustomSize.astro` | `t` | The live demo; script in `src/scripts/case-multi-shop.ts`. |
| `multi-shop/Vignette.astro` | `vignette` | The four multi-shop drawings. |
| `school/Screens.astro` | `lang`, `t: screens` | The DESKTOP and PHONE tabs, one before and after slider each (below). |
| `school/Compare.astro` | `variant`, `before`, `after`, `alt`, `c`, `frame` | One before and after slider with tandem scroll. Script in `src/scripts/case-school.ts`. |
| `school/Vignette.astro` | `vignette` | The four language school drawings. |
| `school/Editor.astro` | `lang`, `t` | "The editor" (`AfterChanges`): heading, text and the CMS frame, a still until the recording exists (below). |
| `warehouse/Screens.astro` | `lang`, `t: screens` | The Today screenshot (the only screen Figma draws) in a frame capped at 85vh. Loads `src/scripts/case-warehouse.ts`, which cycles the tabs every 4s while in view once there is more than one, and pauses while a frame is expanded or in use. |
| `warehouse/Vignette.astro` | `vignette` | The four warehouse drawings. |

### Screens and tabs

```astro
<Screens t={t}>
  <ScreenShot slot="today" shot={{ src: today, width: 1344, height: 921 }} alt={t.alt.today} frame={t.frame} />
  <MyPanel slot="orders" />
</Screens>
```

With JavaScript off every panel is shown, stacked, and the tabs are links to them. A small
inline script in `Screens.astro` turns them into an ARIA tab list (arrow keys, Home, End) and
shows one panel at a time. Hooks for a study's own script, on the `[data-screens]` section:

- `case:tab` event (bubbles) after every change, `detail: { id, index }`;
- `dataset.activeTab` holds the current tab id;
- dispatch `new CustomEvent('case:select', { detail: { index } })` on it to switch tabs
  (indexes wrap, so `index + 1` cycles).

### Expandable frames (`EmbedFrame.astro`)

Every embedded site screen (the school slider, the shop and warehouse captures) sits in one
`EmbedFrame`. It opens compact and one button expands it and shrinks it back.

| | From 768px | Below 768px |
| --- | --- | --- |
| Collapsed (initial) | two thirds of the column, centred, height in proportion to `frame` | full column width, at most 300px tall |
| Expanded | full column at `frame` (1344 × 707 school, 1344 × 726 shop, 1344 × 921 warehouse, capped at 85vh) | full column at `phoneFrame` (350 × 420 school and shop, 350 × 240 warehouse) |

- Sizes are CSS only, from custom properties the component sets inline (`--embed-r`,
  `--embed-rp`, `--embed-c`, `--embed-cp`, `--embed-cap`). An inline script marks the frame
  `data-embed-state="collapsed"` before first paint, so nothing shifts on load. The panel of
  `Screens.astro` narrows with it (`.screens__panel:has(> .embed[data-embed-state='collapsed'])`).
- Without JavaScript there is no state attribute: the frame is expanded, scrolls natively and
  has no button (the button is `hidden` in the HTML and shown by the script).
- The slot holds one element marked `data-embed-scroll`, filling the frame, with
  `role="group"` and an `aria-label`. `content` / `phoneContent` (height ÷ width of what is
  inside) stop the frame growing past a short image. `noJs="content"` lets the slot bring its
  own no-JS layout (the slider). `--embed-scale` (1, or 2/3 collapsed on desktop) is there for
  drawn parts that should shrink with the frame (the slider handle).
- Button: a real `<button>` with `aria-expanded`, labels from `screens.frame.expand` /
  `.shrink`, 44px target. The change animates in 0.26s (width of the panel, height of the
  frame); not under reduced motion. The inner scroll position is kept in proportion and the
  frame is scrolled back under the header if its top left the screen. State is per frame and
  not stored. On a phone, when the image already fits the collapsed frame, the button hides.
- Wheel rule. Collapsed: the inner page does not scroll (`overflow-y: hidden`) until a click,
  a tap or focus inside the frame sets `data-embed-active`; a press or focus outside, or the
  frame leaving the screen, clears it. Expanded: the inner page scrolls and hands over to the
  page at either end. `data-lenis-prevent` is on the frame only while the inner page takes
  the wheel.
- Scroll cue: a 3px progress bar on the right edge, only when there is something to scroll.
  The scrolling box is then a tab stop (arrows, PageUp, PageDown, Space).
- `case:embed` (bubbles, `detail: { state, active }`) fires on every change.

To add a screen: export or capture the image (redacted), import it in the study's
`Screens.astro` and add `<ScreenShot slot="<tab id>" shot={{ src, width: 1344, height: <frame
height> }} phone={{ src, width: 350, height: <frame height> }} alt={…} frame={t.frame} />`.
The image may be any height: the frame keeps `width` × `height` and a taller image scrolls.
Images taller than 4096px go out as WebP only; keep every side under 16383px. The phone image
is only fetched below 768px and the desktop one only above.

### Before and after slider (language school)

`school/Screens.astro` fills the `desktop` and `phone` slots of `<Screens>` with one
`school/Compare.astro` each (`variant="desktop"` / `"phone"`). Copy comes from
`t.screens.compare` (`before`, `after` as drawn; `handle`, `valueText` and `scroll` are the
slider's accessible name, its spoken value and the name of the scrolling box, not in Figma).
Alt texts are `t.screens.alt.before` / `after` / `beforePhone` / `afterPhone`.

- Images: full-page captures of both homepages in `src/assets/case/school/*-full.png`
  (desktop 2688 wide = 1344 CSS px at 2x; phone 780 wide = 390 at 2x). They are the one
  exception to "export from Figma": each was redacted in the page before the screenshot (logo
  replaced by the Redacted badge, identifying text rewritten or hidden, client photos replaced
  by stock photos). The capture scripts are private and not in this repo; never drop in an
  unredacted capture. Keep every side under 16383px (the WebP limit; AVIF and WebP both
  encode at the current sizes).
- Without JavaScript the two pages are stacked, each with its label, each in its own scrolling
  box no taller than the frame (707px, or 120vw on small screens), focusable and named by its
  label. An inline script sets `data-enhanced` before first paint, which overlays them, shows
  the handle and moves the tab stop to the shared scrolling box.
- One number, `--pos` (0 to 100%), is the share of the frame that shows the old site. The new
  site is clipped with `clip-path`, the line and handle sit at `left: var(--pos)`.
- The control is a real `<input type="range">` under the handle: arrow keys, Home, End and
  screen readers work through it. Pointer events on the frame do the dragging (`touch-action:
  pan-y`, so a vertical swipe scrolls; the handle itself is `touch-action: none`).
- Tandem scroll: both pages are children of one scrolling box (`data-compare-scroll`, which is
  also the frame's `data-embed-scroll`), so one scroll position moves both, 1:1. Wheel, swipe
  and the keyboard scroll it under the frame's wheel rule (it is a tab stop with `role="group"`
  and a label; `case-school.ts` passes the wheel through the handle). The handle, the line and the labels are outside the scrolled
  content and stay put. At either end the scroll carries on to the page.
- The two pages are not the same height. The box is as tall as the longer one; the shorter one
  is `position: sticky` with `top: frame height − its own height` (from `--ratio`, set inline
  per image, and `--page-w`), so when its footer reaches the bottom of the frame it stays there
  while the longer page finishes. There is never empty space, and no scroll listener.
- First view: the handle sweeps from 100 to 50 (1.1s, ease lift); any press takes over. Under
  reduced motion, and on a tab that is opened later, it just rests at 50.
- Frame sizes come from the `EmbedFrame` (above); these are the expanded ones. DESKTOP tab:
  1344 × 707; below 768px the 350 × 420 frame shows a crop of the desktop pages (2.28 frames
  wide, centred). PHONE tab: the panel keeps 1344 × 707 and the phone pages sit in a 390px
  column in its middle; below 768px they fill the 350 × 420 frame. Collapsed: the desktop
  pages span the frame width (also on a phone, no crop), the phone column is 260px, and the
  handle and line are two thirds of their size on desktop.
- Images are lazy; the hidden tab's pair is only fetched when that tab is opened. The `sizes`
  for the desktop pair on phones deliberately asks for the 1344 file, not the 2688 one.
- The script handles any number of `[data-compare]` blocks.

### The editor recording (language school)

`school/Editor.astro` shows the exported still of the CMS frame. When the clean recording
exists (city already swapped in the page, logo cover baked into the video), put the files in
`public/video/` and change one line in that component:

```ts
const recording = { webm: '/video/cms-live-preview.webm', mp4: '/video/cms-live-preview.mp4' };
```

It then renders `<video data-autoplay-inview muted loop playsinline preload="none" poster=…>`
with the still as the poster; `scripts/motion/autoplay.ts` plays it while it is in view. Never
use the hidden "Recording (animated GIF)" layer from Figma: it shows the real city.

### Vignettes

`Changes.astro` gives each drawing a 440 × 200 box and the custom property `--v`, one vignette
pixel (0.98px on desktop, about 0.63px at 390). The Figma vignettes are that box scaled, so
divide Figma's desktop numbers by 0.98 and write sizes as `calc(N * var(--v))`. See
`multi-shop/Vignette.astro` for the pattern (`--x`, `--y`, `--w`, `--h`, `--s` inline, a few
shared classes). Illustrative vignettes can instead be exported at 2x and rendered as an
image filling the box. The box is `aria-hidden`: the card's title and text carry the meaning.

## Conventions used here

- Headings: `calc(N * var(--u) * var(--case-display, 1))`. The route sets `--case-display`
  (and `--case-display-phone`) to 1.1 under `:lang(bg)`, because every Bulgarian frame sets
  its Cormorant headings 10% larger than the English ones (150 → 165, 72 → 79.2, 40 → 44).
- Phone layout below 768px follows the 390 frames. Bulgarian phone is not drawn and reuses it.
- Motion hooks only: `data-reveal-group` / `data-reveal` on facts, change cards, result
  numbers, flow steps and the two "Where it started" columns; `data-count` on result values;
  `data-case-next` and `data-case-next-title` on the Next band. No animation is written here.
