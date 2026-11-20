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
  `tablistLabel`, `alt` (by tab id) and `openLabel`.
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
| `ScreenShot.astro` | `shot {src,width,height}`, `phone?`, `alt`, `openLabel`, `loading?` | A composite as `<Picture>` (AVIF, WebP), linked to the full-size image. `phone` swaps in below 768px. |
| `Started.astro` | `t: started` | Two columns, stacked on phone. |
| `Changes.astro` | `t: changes`, `Vignette?` | Card grid. Sets the `--v` unit for vignettes. |
| `Results.astro` | `t: results` | Dark band. Column count follows `numbers.length`. |
| `Built.astro` | `t: built` | Flow of steps; arrows turn down below 1024px. |
| `Next.astro` | `t: next`, `href` | The band is one link. Round button, as drawn. |
| `CaseFooter.astro` | `lang`, `t: footer` | Case study footer with the footnote. The route passes `footer={false}` to Base. |
| `multi-shop/Screens.astro` | `lang`, `t: screens` | Homepage screenshot and the Custom size demo. |
| `multi-shop/CustomSize.astro` | `t` | The live demo; script in `src/scripts/case-multi-shop.ts`. |
| `multi-shop/Vignette.astro` | `vignette` | The four multi-shop drawings. |
| `school/Screens.astro` | `lang`, `t: screens` | The before and after slider (below). Script in `src/scripts/case-school.ts`. |
| `school/Vignette.astro` | `vignette` | The four language school drawings. |
| `school/Editor.astro` | `lang`, `t` | "The editor" (`AfterChanges`): heading, text and the CMS frame, a still until the recording exists (below). |
| `warehouse/Screens.astro` | `lang`, `t: screens` | The Today screenshot (the only screen Figma draws). Loads `src/scripts/case-warehouse.ts`, which cycles the tabs every 4s while in view once there is more than one. |
| `warehouse/Vignette.astro` | `vignette` | The four warehouse drawings. |

### Screens and tabs

```astro
<Screens t={t}>
  <ScreenShot slot="today" shot={{ src: today, width: 1344, height: 921 }} alt={t.alt.today} openLabel={t.openLabel} />
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

### Before and after slider (language school)

`school/Screens.astro` puts one slider in the `desktop` slot of `<Screens>`. Copy comes from
`t.screens.compare` (`before`, `after` as drawn; `handle` and `valueText` are the accessible
name and spoken value, not in Figma).

- Without JavaScript the two screenshots are stacked, each with its label. An inline script
  sets `data-enhanced` before first paint, which overlays them and shows the handle.
- One number, `--pos` (0 to 100%), is the share of the frame that shows the old site. The new
  site is clipped with `clip-path`, the line and handle sit at `left: var(--pos)`.
- The control is a real `<input type="range">` under the handle: arrow keys, Home, End and
  screen readers work through it. Pointer events on the frame do the dragging (`touch-action:
  pan-y`, so a vertical swipe still scrolls the page; the handle itself is `touch-action: none`).
- Both pages are children of one scrolling box (`data-compare-scroll`), so they always scroll
  together. The Figma composites are exactly the height of the frame, so today there is nothing
  to scroll; drop in a taller pair and it scrolls (the script then adds `data-lenis-prevent`
  and a tab stop).
- First view: the handle sweeps from 100 to 50 (1.1s, ease lift); any press takes over. Under
  reduced motion it just rests at 50.
- Below 768px the frame is the 350 × 420 crop from the phone frame, centred on the handle.
- A PHONE tab needs redacted phone captures of both sites, which Figma does not have yet. When
  it does: add the tab in both content files and a second slider block in `slot="phone"`. The
  script handles any number of `[data-compare]` blocks.

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
