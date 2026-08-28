# Progress

Handoff notes between working sessions. `CLAUDE.md` is the contract and does not
change; this file is only *where the build has got to*. One line per step, plus
the deviations that are still open.

**Starting a session:** read this file, do the next unchecked step, then update
this file as part of that step's diff.

## Steps

Order is `CLAUDE.md` § Suggested order.

- [x] **Tokens and shell** — `app/tokens.css` (every colour, type size, tracking,
      radius, shadow, easing), `app/globals.css` (body surface, two section
      backgrounds, reduced-motion floor, `.hero` sticky box), `app/fonts.ts`,
      `app/layout.tsx`, `lib/tokens.ts` (the four values JS needs as numbers).
      `app/page.tsx` holds the five section landmarks.
- [x] **Hero static, desktop** — `app/hero.tsx` + `app/hero.css`. Verified
      box-for-box against the design at 1440px.
- [x] **Hero parallax** — `app/use-hero-parallax.ts`, mounted by `app/hero.tsx`
      (now a client component). One passive `scroll` handler writing transform /
      opacity / filter straight to the DOM. Carries both tunings: the five numbers the two design
      files disagree on (`span`, `lift`, `shrink`, `blushRest`, `blushGrow`) are
      read per event off a `matchMedia` at 900px, so crossing the breakpoint
      needs no reload. Verified numerically against both design files.
- [x] **Language dictionaries and crossfade** — `app/lang.tsx` (`LangProvider`
      + `useLang`, owning `lang` / `fading` / `slot` and the `switchLang`
      choreography), `app/lang.css` (the `.lang-fade` block), `app/lang-toggle.tsx`
      + `.css` (the fixed EN/БГ pill). `page.tsx` wraps the page in the provider
      and stays a server component; `hero.tsx` now reads `t` and `fading` from
      context instead of props, and `use-hero-parallax.ts` absorbed
      `setHeroTransition` — it turns the hero's transitions on before writing
      the faded opacity and strips them 300ms after the fade, which is what the
      design's `switchLang` did by hand. Toggle geometry measured identical to
      both design files at 1440px and 500px.
- [x] **About / education / languages** — `app/about.tsx` + `app/about.css`,
      rendered by `page.tsx` in place of the empty `#about` container. One
      section at both breakpoints: a two-column grid above 900px, one column
      below, where the grid's 56px gap stands in for the two separate mobile
      sections (`#about` + `#education`, 10px + 46px of padding between them).
      Both ids survive. First block on the page to carry `.lang-fade`.
      Measured element-by-element against both design files at 1440 and 430 —
      every box, type size, line-height, colour and margin matches to 0.1px.
- [x] **Reveal observer** — `app/reveal.tsx` (one IntersectionObserver for the
      page, rendering nothing, mounted by `page.tsx`) + `app/reveal.css` (the
      hidden state, the lift, and the transition, keyed off `[data-rv]` /
      `[data-revealed]`). Distance and duration are custom properties declared
      on `:root` and overridden *on the element* by whichever section differs,
      so proximity of inheritance decides and no section has to out-specify the
      file. `about.css` gave up its own copy of the transition and now sets only
      the `.12s` desktop stagger. Threshold is per breakpoint — `.14` desktop,
      `.1` phone — so `REVEAL_THRESHOLD` in `lib/tokens.ts` became a pair and
      the observer is rebuilt on a `matchMedia` change. Ladder-tested against
      both design files: identical crossing band at 1920 and at 500.
- [x] **Work rows** — `app/work.tsx` + `app/work.css`, rendered by `page.tsx` in
      place of the empty `#work` container. The head rule, the three rows with
      their `order:` flip, the text column (kind, title, what, built, italic
      note, tags) and OurMoney's two phone shots. The preview frames the first
      two rows carry landed in the step below; at the time this one was
      measured those rows showed text against an empty media column. Which
      media a project gets is keyed by index, not by
      the design's bilingual name regex — same three answers, and a
      translation cannot break it. Measured element-by-element against both
      design files at 1440 and 430: every box, type size, tracking, colour and
      margin matches to 0.5px once the missing previews' height is accounted
      for, and the reveal ladder crosses in the same band.
- [x] **Preview components** — `app/preview.tsx` + `app/preview.css`, filling
      the media column of the first two work rows. `PreviewLive` is the
      Multi-brand row: three Trade Portal mock pages, each in its own iframe at
      1440x1500, scaled by `min(holderW / 1440, maxH / 1500)` and cropped by a
      measured, bordered viewport — the one preview with a `ResizeObserver`
      behind it (`portalW`). `PreviewShots` is the B2B row: the two captures as
      background images on divs that *are* the fitted picture, `aspect-ratio`
      holding one axis and `width: min(100%, w * maxH / h)` the other, so a
      1482x870 frame and a 520x824 one both hug their own shape. Both mount
      every target at once and crossfade. `maxH` is 430 desktop / 380 phone:
      the live frame reads it off a `matchMedia`, the shots get both caps as
      custom properties so the phone value applies on the first paint.
      Measured against both design files at 1440 and at 500, on both tabs of
      each preview: every box, scale factor, transform and colour identical to
      0.01px.
- [x] **Tech stack** — `app/stack.tsx` + `app/stack.css`, rendered by `page.tsx`
      in place of the empty `#stack` container. The header row (kicker, heading,
      note), the three-column card grid and the card: italic title over a rule,
      then one row per tool. Group titles are copy; the tool names are not —
      they are constants in the design's own `stack` array and absent from
      `content/copy.ts`, so they stay constants here, the same call the preview
      tab labels got. One markup for both breakpoints: the phone design has no
      inner wrapper and no items wrapper, which amounts to the header stacking
      and 6px of air under the card's rule disappearing, so both are media
      queries rather than a second tree. The card is the first block to be a
      `[data-rv]` target *and* carry a hover transition; `reveal.css` grew an
      appendable slot for it. Measured element-by-element against both design
      files at 1440 and 500: every box, type size, tracking, colour and margin
      identical, hover end-state identical, and the language switch translates
      the four strings that are copy without remounting a card.
- [x] **Contact and slot picker** — `app/contact.tsx` + `app/contact.css`,
      rendered by `page.tsx` in place of the empty `#contact` container. The
      blush, the availability chip, the two-line heading, the sub-line, the
      six-slot picker, the echoed selection beside the confirm pill, and the
      footer. `slot` is read from `useLang()` rather than held locally, which
      is what makes the language switch clear it. The two designs disagree
      about the footer more than anywhere else on the page — desktop is one
      centred row of `label ↗` links plus the location string, the phone is a
      stack of full-width `label … handle ↗` rows under an uppercase footer
      line — so both are in the markup and one is `display:none` per
      breakpoint, the call the hero's `stat3` / `stat3short` pair already
      made. Two new tokens: `--tracking-contact` and
      `--color-blush-contact-mobile`. Measured element-by-element against both
      design files at 1440 and 500, in both languages and in both slot states:
      every box, type size, tracking, colour and margin identical to 0.01px,
      and all three desktop hovers (slot, confirm, social link) verified with
      transitions frozen.
- [x] **Sheen hover pass** — `app/sheen.css`, imported by `globals.css`. The
      two gradients (`--sheen-light` / `--sheen-dark`) and the sweep's
      duration/easing pair (`--sheen-sweep`) now have one home; the eight
      copies of the gradient and seven of the transition entry across
      `hero.css`, `lang-toggle.css`, `work.css`, `stack.css` and `contact.css`
      reference them. Plus the audit the pass exists for: every
      `linear-gradient` in both design files enumerated and matched against the
      build (11 desktop / 6 mobile sheen sites, one unrelated `112deg`
      placeholder stripe), and `design/HANDOFF.md` § Sheen hover's list of
      elements walked one by one. Verified as a no-op: the computed
      `background-image` / `-size` / `-repeat` / `-position` / `transition` of
      all eight sheened elements are byte-identical before and after at 1440
      and 500, in both slot states, and a live hover on each hero CTA still
      sweeps to -60% with its lift, shadow and border intact.
- [x] **Mobile pinned bar** — `app/bookbar.tsx` + `app/bookbar.css`, mounted by
      `page.tsx` outside the shell beside the toggle, and `app/jump-to.ts`, the
      measured in-page nav handler the bar's `#contact` link needs. The bar is
      shown by the page's one scroll handler, not by CSS: `useHeroParallax`
      gained the `[data-bookbar]` block it was always going to gain, fading and
      sliding it in past `p > .85` off the same `p` that drives the hero. Its
      label and target follow `slot` — *Book a 30-minute call* → `#contact`
      with nothing picked, *Continue · <slot>* → the calendar once one is.
      Measured against the mobile design in a 500x900 iframe: resting rect,
      every computed property, the crossing scrollY (613 on both), the label
      and href in both languages and both slot states, all identical. `jumpTo`
      verified against both design files by capturing the `scrollTo` argument —
      same target to 0.001px, 76 desktop and 64 mobile.
- [x] **Reduced-motion audit** — `app/globals.css` § Reduced motion (the rule
      and the reasoning), plus the two gestures it removes, each handled where
      it is declared: `app/reveal.css` (`--reveal-shift: 0px`) and
      `app/bookbar.css` + `app/use-hero-parallax.ts` (the bar's 16px slide, in
      both the resting rule and the handler, or it animates once on mount).
      The header step added a third gesture of the same shape, handled the
      same way — see that step.
      Every motion on the page enumerated and ruled on one by one — see
      *Settled decisions*. The blanket `transition-duration: 0.01ms !important`
      the shell step laid down is gone: it was a bigger deviation from the
      design than anything else in the file and it turned both crossfades into
      flashes. Verified under a genuinely emulated preference at 1440 and 500,
      in both states — see *Verifying a section*.

- [x] **Sticky header** — `app/header.tsx` + `app/header.css`, mounted by
      `page.tsx` outside `.shell` beside the toggle and the bar. Not in
      `CLAUDE.md` § Suggested order — it was the last open deviation with
      pixels attached, so it lands here. Its reveal joined `useHeroParallax`
      rather than adding a second listener: the same `p` now shows the header
      past .55 (.5 phone) and the booking bar past .85, which is what the
      design's one handler does. `Tuning` grew the three numbers the two files
      disagree on for it (`navAt`, `navLift`, `navCentred`). Desktop is brand
      plus four links; the phone header is the brand alone, so the whole `<nav>`
      is `display:none` below 900px. Verified: every computed style and rect on
      the bar, the brand, the avatar, the name, the nav and all four links is
      identical to the design at 1440 and at 430 — the only differences left
      are next/font's fallback in the family stack and the nav box the phone
      design does not have.

- [x] **Mobile hero pass, ship hygiene, locale routes** — the last step, in
      three unrelated halves.

      **A. The phone hero.** `app/hero.css` grew the breakpoint it was the one
      file in `app/` without: a `@media (max-width: 899px)` block at the foot
      carrying every delta the plan measured, and a `@media (min-width: 900px)`
      block in the middle carrying the two things the phone design does *not*
      have. Three new tokens (`--text-hero-mobile`, `--shadow-portrait-mobile`,
      `--width-blush-mobile`); the rest are literals, as the other phone blocks
      already do for one-off sizes.

      The middle block is the part worth knowing about. Overriding the sheen
      below 900px was not enough — the gradient, the transition and the two
      `:hover` rules all had to *not be generated* there, or the phone CTA
      would carry a hover lift and a sweep the phone design has no trace of.
      Same for the content column: `[data-hero]` on the phone is
      `position:relative; z-index:5; text-align:center` and nothing else, so
      `display:flex; flex-direction:column; align-items:center; max-width`
      moved into the min-width block rather than being overridden to
      `display:block` — otherwise `flex-direction` still computes `column` on
      a box that is not a flex container, and the dump does not match. Both
      follow `work.css` / `stack.css`, which already gate their sheen this way.

      Both behavioural differences were ruled on, and both rulings are in
      `app/hero.tsx`'s header comment:

      - **The phone's primary CTA routes to `#contact`, not to the calendar** —
        followed, as the plan recommended. It differs in `href`, `target` *and*
        handler, so it cannot be one element styled two ways: both anchors are
        in the markup and one is `display:none` per breakpoint, the call the
        work count label and the contact footer already made. The server
        renders the same HTML either way and no JS reads the viewport width.
      - **The phone's second CTA is a bare `<span>`** — overruled, as the plan
        recommended. It stays the anchor it is on desktop and keeps `jumpTo`,
        taking only the phone's pixels. Measured: the only differences left
        against the design at that element are `_tag` (`A` vs `SPAN`) and
        `cursor` (`pointer` vs `auto`). Not one box moves.

      Verified with a same-origin iframe probe measuring 19 elements — every
      rect plus 50 computed properties — on the build and on the design file
      side by side, at 500 and again at 1440. **Everything matches at both
      widths** bar two knowns: `fontFamily` (next/font's `… Fallback` entry in
      the stack) and `borderTopStyle` (`solid` at 0 width, Tailwind preflight),
      on every element; plus next/image's `display:block` / `max-width:100%` /
      `aspect-ratio` on the portrait `<img>`, whose rect is identical and whose
      box is clipped by its parent either way. The desktop dump is proof the
      min-width restructure changed nothing above 900px.

      **B. Ship hygiene.** All four items closed.

      - **Favicon** — `app/icon.png`, 512×512. Ink field, page-coloured roman
        Instrument Serif `D`, which is how her first initial is set in the
        hero.
      - **Open Graph** — `metadataBase`, `openGraph`, `twitter`, `canonical`
        and `alternates.languages` (plus `x-default` → `/en`) in
        `generateMetadata`, per locale. Title is `first last — role` and the
        description is `bio`, both read from `content/copy.ts` in that
        language; no string was written or translated for this. The cards are
        `public/og-{en,bg}.png`: the hero reduced — portrait with its ring,
        role kicker, name roman over surname italic, on `--color-page` with
        the blush and the dot grid behind. That is the plan's safe default;
        **Daniela has still not said what she wants on it**, so it is the one
        thing in this build chosen rather than specified.
      - **`app/robots.ts` and `app/sitemap.ts`** — both prerendered. The
        sitemap is the two locale routes, each naming the other as its
        `hreflang` alternate; `/` is not listed, because it is a redirect.
        `app/site.ts` holds `SITE_URL`, `LOCALES` and `isLocale` for all three
        files plus the layout.
      - **The mock pages' Google Fonts links** — **self-hosted**, not deferred
        again. Newsreader and Manrope, latin and latin-ext only, in
        `public/mock/assets/fonts/`, behind `public/mock/assets/fonts.css`;
        all five mock pages link that instead. `grep` for `https?://` across
        `public/mock/*.html` now returns nothing: **the previews make no
        third-party request at all.** Reason for choosing this over recording
        it: the Trade Portal pages are iframed *live* inside the work section,
        so a Google request there is a third-party request on the portfolio's
        own critical path — which is exactly what closing the Pexels gap was
        about. Verified by screenshot: the mock still sets in Newsreader roman
        and italic and in Manrope.

      **C. `/en` and `/bg`.** The root layout moved to `app/[lang]/layout.tsx`
      — it renders `<html lang>` and `<body>`, and there is no `app/layout.tsx`
      any more, since only one layout may own those and it has to be the one
      that knows the language. `app/[lang]/page.tsx` reads the segment and
      hands it to `LangProvider` as `initialLang`; that prop was already there
      and nothing else in the provider changed. `generateStaticParams` returns
      both locales and `dynamicParams = false`, so an unknown segment is a 404
      decided at build rather than a render on demand. `/` → `/en` is a 307
      from `next.config.ts` `redirects()`; not middleware, and not permanent —
      which locale `/` lands on is a default, not a fact about the URL.

      **The trap the plan named was avoided and then measured.** The toggle
      does not navigate: `switchLang` calls `window.history.replaceState`
      alongside the dictionary swap, which is the exact call Next's own docs
      give for a locale switcher and re-renders nothing. Probed at 1440 with
      the page scrolled to 220: URL `/en` → `/bg`, `documentElement.lang`
      `en` → `bg`, the `<h1>` swapped to Bulgarian, `scrollY` still **220**,
      `history.length` unchanged at 2, the hero's opacity target stepped to
      exactly ×.22 of its scroll-driven value and back, and the two
      `CSSTransition` objects (opacity + filter, .26s) appeared on
      `[data-hero]` for the length of the fade and were then stripped. No
      remount, no lost scroll position, no lost fade.

      `next build` prerenders every route: `● /en`, `● /bg`, `○ /icon.png`,
      `○ /robots.txt`, `○ /sitemap.xml`. No route handlers, no server actions,
      no `process.env`, no `fetch` — the build still has no backend.

- [ ] **Deploy** — the first step that is not about the design. The build is
      ready; the deployment is not set up. Verified against a real production
      build (`next build` + `next start`, not `next dev`): `/` 307s to `/en`,
      `/en` `/bg` 200, `/xx` 404, `robots.txt` `sitemap.xml` `icon.png` both OG
      cards the mock pages the self-hosted woff2s and the `next/image` endpoint
      all 200, the console is clean — no hydration mismatch, no failed load —
      and both locales render correctly. The calendar and GitHub links resolve.
      (LinkedIn answers `curl` with 999; that is its anti-bot response, not a
      broken link. Do not "fix" it.)

      **Host: Netlify. Decided by Daniela on 2026-08-28, and it is a licensing
      decision, not a technical one.** Vercel was the recommendation until the
      terms were actually read. Vercel's Hobby tier is "restricted to
      non-commercial personal use only", and their fair-use guidelines define
      commercial usage as any deployment "used for the purpose of financial
      gain of *anyone* involved in *any part of the production* of the
      project", listing **"advertising the sale of a product or service"** as
      an example. `stat3` is "Open to freelance work" and the primary CTA
      books a call. That is not a grey area, so Vercel would have been Pro at
      **$20/month**. Netlify's free plan permits commercial sites — the bar
      there is reselling the hosting itself. Netlify it is, at $0.

      **Usage was never the question.** Measured: 956K of JS/CSS, 9.6MB of
      `public/` (mostly the preview photos, which only load when someone
      scrolls to the work section), 28K and 32K of prerendered HTML, and
      exactly one `next/image` on the page — the portrait. Counting a full
      visit generously at 10MB, a 100GB monthly allowance is ~10,000 visits.
      Every free tier considered fits this site many times over. The $20 would
      have been a licence fee.

      **Nothing in the build changes for Netlify.** Their adapter supports
      Next 13.5+ (so 16.3), auto-detects App Router, and handles
      `next.config` redirects and `next/image` (through the Netlify Image CDN)
      natively — so the `/` → `/en` redirect and the portrait keep working and
      `output: 'export'` stays off. `netlify.toml` is committed and pins only
      the Node version and the build command; it deliberately does not set
      `publish` or pin the adapter, for the reasons in its own comments.

      **If the host is ever reconsidered**, the fork is `output: 'export'`,
      which `node_modules/next/dist/docs/01-app/02-guides/static-exports.md`
      § Unsupported Features rules out today: `redirects()` and the default
      image loader are both on that list, so a loose-files host (Cloudflare
      Pages, GitHub Pages) costs three changes — `output: 'export'`,
      `images.unoptimized: true`, and moving `/` → `/en` to a host rule.
      Note also that `PROGRESS.md` said "static hosting" from the contact step
      onward and several steps repeated it: `○ (Static)` in the build output
      means *prerendered*, not *deployable as loose files*. That was an
      assumption carried forward unchecked.

      **A. The domain.** `app/site.ts` says `https://danielageorgieva.work` —
      Daniela named it on 2026-08-28 and was buying it that day. **It did not
      resolve when this was written** (NXDOMAIN). It is the only value in the
      build that depends on something outside the repo, and it feeds
      `metadataBase`, every canonical, both OG cards' URLs, the sitemap and
      robots. Confirm it resolves before treating any link-preview problem as
      a code problem.

      **B. The setup.** Connect Netlify to `origin`
      (`danielageorgiewa/dev-portfolio`), branch `main`; the build command and
      Node version come from `netlify.toml`. Attach the domain, then check in
      this order: `/` redirects to `/en`; `/bg` serves `<html lang="bg">` in
      *view-source*, not merely after hydration — that is the entire point of
      the locale segment, and it is the one thing a bad adapter build would
      silently lose; the OG card renders in a link preview; `/sitemap.xml`
      carries the live origin. Netlify's free plan is 100GB bandwidth and 300
      build minutes a month, both far above this site.

      **C. What is still missing and is not blocking.** No CI — nothing runs
      `npm run lint` (which is `tsc --noEmit`) or `next build` on a push;
      Netlify will fail the deploy on a type error, which is a slower feedback
      loop than a check on the PR. No `apple-icon`. No analytics, which nobody
      has asked for. And the OG card is still this build's composition rather
      than Daniela's call — see the deviation below.

**Every design step is done.** Both design files are matched at both breakpoints,
every section and every interaction in `design/HANDOFF.md` is built, the two
`CLAUDE.md` § Known gaps that were actionable are closed, and the site has the
metadata, the icon and the locale routes a public URL needs.

What is left is the deploy step above, plus one open question and the
deviations below. The question: **the OG card is the only thing in this build
that was chosen rather than specified.** It follows the plan's safe default (the hero,
reduced, in copy that already exists), but Daniela has not said what she wants
on it. Re-render it from `tools/og/` if she does; the command is in the README
there.

## Open deviations

Things the build knowingly does not do yet. Each names the step that closes it,
so it is not mistaken for a bug.

- **The hero's primary CTA is in the markup twice**, one copy `display:none`
  per breakpoint, because the two designs send it to different places. Same
  mechanism as the work count label and the contact footer, and it costs one
  hidden anchor — `display:none` keeps it out of the accessibility tree and
  out of the tab order, so nothing reads or focuses it twice. The alternative
  was reading the viewport width in JS to pick an `href`, which would have put
  the wrong URL behind a middle-click until hydration.
- **The phone's "See three projects" is a link here and a dead `<span>` in the
  design.** Ruled a prototype slip, not a decision — see the step above. It is
  the only place the phone build is deliberately more than the phone design,
  and it moves no pixel: `_tag` and `cursor` are the entire measured
  difference.
- **The favicon and the two OG cards are invented.** Nothing in
  `design/HANDOFF.md` or either design file specifies either. They are built
  only from things the design does have — the ink/page pair, Instrument Serif,
  the portrait with its ring, the blush, the dot grid, and `first` / `last` /
  `role` from `content/copy.ts` — but the compositions are this build's.
  Sources and the re-render command are in `tools/og/`.
- **The inactive live-preview iframes are not hidden from assistive tech.**
  All three are mounted and `pointer-events:none`, and the two faded-out ones
  still carry a real document a screen reader can walk into. The design has
  the same property. The two screenshot layers *are* handled — the inactive
  one is `aria-hidden`, because it is a bare div and hiding it costs nothing.
- **`.lang-fade` is carried by the about grid, the work and stack inner
  columns, the contact column and the header's nav** — every translated block
  in the build except the hero, the pinned booking bar and the header's own
  brand name, all three deliberately exempt. The brand is the design's call:
  `{{ langFade }}` sits on the desktop `<nav>` and not on the name beside it,
  so the name holds its place through the swap. Measured — the nav walks
  1 → .96 → .84 → … → .22 on the same curve as the design's while the brand
  stays at 1 on both pages. The hero has its opacity written by
  the scroll handler, which multiplies the same `.22` itself — carrying the
  class too would compound the two — and the bar carries no `{{ langFade }}`
  in the design either. Every translated block built from here on
  has to opt in with the class; the design's own list is wherever
  `{{ langFade }}` appears.
- **The hidden booking bar's link is `inert`, which the design's is not.** At
  rest the design leaves the bar `pointer-events:none` and its link still in
  the tab order, so a keyboard lands on an invisible control. The three style
  writes the handler makes are the design's; the fourth, `bar.inert = !on`, is
  not. Same call as the inactive screenshot layer's `aria-hidden` — hiding it
  costs nothing and changes no pixel — and the opposite of the inactive
  preview iframes, where hiding the document would have cost something. It is
  guarded on the current value, because `inert` moves focus and re-runs focus
  scoping where a style write does nothing.

- **The header's four links are `inert` while it is hidden, which the design's
  are not.** Same call as the booking bar's link, and it buys more here: the
  design leaves an invisible full-width bar across the top of the viewport with
  four focusable, hit-testable links in it. Measured both states — hidden, a
  real pointer click at a link's centre reaches nothing and `.focus()` leaves
  `activeElement` on `<body>`; shown, both work. Nothing sits under the bar
  while the hero is on screen (the language toggle is z-index 80, above it), so
  no reachable target is lost. Guarded on the current value, as the bar's is.
- **The design's third media branch is not built.** `noShots` — a striped
  placeholder box holding `p.slot` — is unreachable: all three projects match
  either the OurMoney test or the portal regex, in both languages. Nothing
  renders `projects[i].slot`, in the design or here.
- **Tag sheen and tag hover stop at 900px.** The phone design's tag has no
  gradient, no transition and no `style-hover`; the desktop one has all three.
  Mobile is authoritative below 900px, so the sheen block is wrapped in
  `min-width:900px` rather than left running under a breakpoint that does not
  ask for it. Resting pixels are identical either way — the gradient parks
  off-canvas at 135%.
- **The observer is armed once, one frame after mount.** Every `[data-rv]`
  block has to be in the tree by then. Nothing on the page mounts late, so this
  holds today; a section that renders its reveal targets conditionally would
  need the observer to re-arm, which today only a breakpoint change does.
- **A `[data-rv]` block taller than the viewport can never reach the
  threshold** and would stay hidden. The design has exactly this property, so
  it is kept rather than guarded against. The work rows were the first blocks
  big enough to test it and they clear it comfortably: the tallest is 849px
  against a 667px phone viewport, so the best ratio is .79 against a .1
  threshold, and all three rows revealed on the ladder. It would take a block
  roughly 7x the viewport to bite; nothing left in the design is close.
- **The stack cards' reveal was not ladder-tested**, unlike the about columns
  and the work rows. Chrome had the browser window behind another app for this
  session, so `requestAnimationFrame` never ran during a `javascript_tool`
  call and a scroll ladder could not settle — see the note under *Verifying a
  section*. What was checked instead: the cards do reveal (two consecutive
  screenshots at the same scroll offset, the first arming the observer and the
  second showing the lift), and the three numbers a ladder would compare are
  identical to the design's — 22px / .9s desktop, 20px / .8s phone, against
  the same page-wide threshold. The failure mode a ladder guards against is
  also not reachable here: the tallest card is 366.5px against a 787px
  viewport and 341px against a 900px one, so the best ratio is 1.0 against a
  .14 threshold.
- The remaining entry in `CLAUDE.md` § Known gaps (`image-slot.js`) is
  untouched and still accurate. The hotlinked Pexels photos are closed — see
  Settled decisions.

- **`text-align:center` is declared on the contact column, not the section.**
  The desktop design puts it on the column and the phone design puts it on the
  section; this build follows desktop at both breakpoints. The section's only
  other child is the blush, which holds no text, so the computed value differs
  on two boxes and nothing renders differently — measured identical at 500.
- **The mobile confirm row is always in the tree.** The phone design has no
  confirm pill in this section at all and renders the echoed slot as a block of
  its own; here the row is one element for both breakpoints with the pill
  `display:none` below 900px. Consequences are handled — see the 18px note in
  Settled decisions — and the echo's rendered position and centre are identical
  to the design's. It collapses to nothing when no slot is picked.

## Settled decisions

Do not "fix" these — they were checked against the running design.

- **Reduced motion removes automatic translation and keeps fades.** This is
  the audit's ruling and it is narrower than either document. The design's
  whole answer is two rules (both files, line 11): `* { animation: none
  !important }` and `html { scroll-behavior: auto }`. The first is provably a
  no-op — grepped both design files and the build, and there is not one
  `@keyframes` or `animation` property anywhere — so the design honours the
  preference in exactly one place, `jumpTo`'s `behavior:'auto'`. The shell step
  went the other way and cut every transition to `0.01ms !important`, which
  stopped the reveal's rise but also turned the 260ms language swap into a
  flash to `.22` and a 1.5px blur inside one frame, and made the sheen
  teleport across a button instead of sweeping. Under a preference for *less*
  motion a flash is worse than the fade it replaced. So: nothing travels
  unless the user asked for it, and nothing that only changes opacity is
  touched. Every gesture on the page was enumerated and ruled on:

  | Gesture | Under `reduce` | Why |
  | --- | --- | --- |
  | Section reveal, 20–28px rise | **removed** | automatic, unrequested translation — the case the preference exists for. `--reveal-shift: 0px`; the `.8–.9s` opacity fade is kept, so a block still arrives as the design staged it, just in place |
  | Pinned bar, 16px slide | **removed** | crosses a threshold and then animates itself over `.35s`. The opacity half is kept |
  | In-page nav | **instant** | already was — `jumpTo` passes `behavior:'auto'`, and `html` is unconditionally `scroll-behavior:auto` |
  | Hero parallax | kept | coupled 1:1 to the scrollbar, no duration of its own, stops the instant the user does. Removing it changes the page's structure, not just its motion. Both design files run it |
  | Language crossfade, preview crossfade | kept | opacity and blur only. Nothing moves |
  | Sheen sweep, hover lifts, hover colour/border/padding | kept | hover-initiated, never automatic; the lifts are 2px. Both design files run them, and `HANDOFF.md` § Sheen hover calls the sweep deliberate decorative polish |
  | CSS `@keyframes` | n/a | none exist. `* { animation: none !important }` is kept anyway as the page-wide floor both authoritative documents name — one line, and unlike the stack row's dead `justify-content` it guards anything added later rather than describing an element that plainly once had a sibling |

  The default rendering is untouched by construction: everything added lives
  inside `@media (prefers-reduced-motion: reduce)` or behind
  `reduce.matches` in the handler, and everything removed lived inside the
  same query. Measured either way — see *Verifying a section* for the harness.

- **`--reveal-shift: 0px` is declared in `reveal.css`, not `globals.css`.**
  Both are `:root`, so neither out-specifies the other and source order
  decides — and the two files land in different CSS chunks whose relative
  order is the bundler's call. Within one file it is not a question, so the
  override sits directly under the `max-width:899px` branch it has to beat.

- **The bar's resting transform is overridden in CSS as well as in the
  handler.** `bookbar.css` parks the bar at `translateY(16px)` and the handler
  writes `translateY(0)` under the preference, so with only the JS half the bar
  animates its 16px exactly once, on mount, as the first write transitions away
  from the resting rule. Measured before the CSS rule was added: the bar was
  mid-slide at `ty` 5.53px a frame after hydration. With both, `ty` is 0 at
  rest, shown and hidden.

- **`body { line-height: normal }`** in `globals.css`. Tailwind preflight forces
  `1.5` on the root; the design computes to `normal` and sets line-height only
  where it matters. The 1.5 inflated every uppercase kicker and pill button, and
  put the hero column 10.7px out.
- **The solid CTA does not darken on hover.** The design file carries two
  `style-hover` attributes on it; the second (`background:#413830`) is a
  duplicate attribute the HTML parser drops, so the running design never applies
  it.
- **`--color-ink-soft: #423a36`** — the outline CTA's label colour, which had no
  existing token.
- **`Copy` in `content/copy.ts` is the widened dictionary type.** It was
  `(typeof copy)['en']`, and because the object is `as const` that made
  `navWork` the type `"Work"` — so `copy[lang]` was a union of two shapes
  neither of which is assignable to the other, and nothing could hold "either
  dictionary". A `Widen<>` mapped type collapses the literals to `string`. A
  type-only change; not one character of copy was touched.
- **Which media a project gets is keyed by index, not by name.** The design
  matches the project name against a bilingual regex (`frameKey`, desktop line
  359) because its `<sc-for>` has nothing else to key on. `content/copy.ts`
  fixes the order, so index 0/1/2 gives the same three answers — retail
  portal, B2B shots, OurMoney phone shots — and cannot be broken by a
  translation.
- **The count label renders twice and is hidden by breakpoint.** Desktop uses
  `t.workCount`, the phone design `t.workCountShort`. Both `<span>`s are in
  the markup and one is `display:none` per breakpoint, so no JS has to know
  the width and the server renders the same HTML either way. The `stat3` /
  `stat3short` pair in the hero will want the same treatment.
- **`'note' in p`, not `p.note`.** The dictionary is `as const`, so OurMoney's
  project type does not carry a `note` key at all and a property access does
  not typecheck. The `in` test narrows; nothing about the copy changed.
- **The language state lives in `app/lang.tsx`, and so does `slot`.** Switching
  language clears the selected slot (`CLAUDE.md`), which is a coupling, so the
  two share an owner. The calendar step reads `slot` / `setSlot` from
  `useLang()` rather than holding its own state.
- **Mobile `scroll-margin-top` is 76px, not the 64px header height.** The
  shell step wired it to `--header-h-mobile`; both design files put 12px of air
  above a scrolled-to section (88px desktop against a 76px header, 76px mobile
  against a 64px one). Corrected in `globals.css` with the about step, and
  `--scroll-offset-mobile` added next to `--scroll-offset`.
- **About is complete at both breakpoints**, unlike the hero. The phone values
  are a handful of type-size steps and four margins, all in one media query at
  the foot of `about.css`; deferring them to a later mobile pass would have
  meant reading the same 35 lines of the mobile design twice.
- **`#education` is kept as an id on the aside column.** It is a section of its
  own in the mobile design, with its own `scroll-margin-top`. Nothing in either
  file links to it; it exists here because it exists there.
- **The Trade Portal mocks no longer hotlink Pexels.** `CLAUDE.md` § Known gaps
  is closed: the ten photos in `design/hotlinked-photos.txt` are downloaded to
  `public/mock/assets/photos/` and all 20 references rewritten — 15 in
  `trade-portal-homepage.html`, 5 in `trade-portal-product.html`. Named
  `pexels-<id>-w<width>.jpeg`, because photo 1487154 is fetched at two widths
  and the id alone would collide. Verified: both mock pages render every photo
  standalone, and the live preview makes zero requests to `images.pexels.com`.
  Cost is 3.6MB in `public/`; the files are byte-for-byte what the CDN served,
  Exif and all, since nothing in the contract asks for the re-encode that
  `public/images/` had. `design/`'s own copies of the mock pages still hotlink,
  deliberately — that directory is reference and ships nothing.
- **The preview crossfade is `.42s ease`, which is what the two authoritative
  documents say and not what the design files run.** `CLAUDE.md` § The five
  details, 3 and `design/HANDOFF.md` § Project preview tabs both give
  `transition:opacity .42s ease` and call the 420ms deliberate; both `.dc.html`
  files write `.78s cubic-bezier(.4,0,.2,1)` inline. The rule the two documents
  exist to protect is *mount every target and crossfade, never swap `src`*, and
  that is honoured either way; on the one number they disagree about, the spec
  wins over the prototype. `--duration-preview` was already `.42s` from the
  tokens step. Everything else about both previews measures identical to the
  running design.
- **Work rows are keyed by index, not by `p.name`.** The name is translated, so
  keying on it remounted both portal rows on every language switch. Measured
  before the fix: the preview reset to its first tab, and the row lost
  `data-revealed` — which is written to the DOM rather than rendered, so React
  does not restore it and the observer, having already unobserved that node,
  never gives it back. Both rows went permanently invisible after one language
  switch. OurMoney was unaffected only because its name is the same in both
  languages. The design keeps `frames` on the root component and is not
  affected; verified against it — its "Sign in" tab survives a switch to
  Bulgarian, and so does the build's now.
- **Tab labels stay English in both languages.** `Homepage` / `Product` /
  `Account` / `Sign in` are constants in the design's `FRAMES` config, not keys
  in `content/copy.ts`. Translating them would be inventing copy.
- **The active tab's underline is an `::after`, not the design's nested span.**
  Measured identical: 77.29 x 1px, `#a8877c`, flush to the tab's bottom edge.
- **The two previews own their own `frames` / `portalW`,** rather than sharing
  the design's maps keyed by project. Each value belongs to one row; the design
  needed a map because one component rendered all three rows.
- **`bg` is dropped from the B2B frame config.** The design carries it on both
  capture pages and never reads it — `screenStyleFor` returns before it can,
  because a screenshot frame has no surface behind the image to paint.
- **The preview tabs are `<button>`s, not the design's `<span>`s**, for the same
  reason the language toggle's are, with the same `:focus-visible` ring.
- **The tab's hover is phone-only, the mirror of the tag's sheen.** The mobile
  design gives the tab `transition:color .2s ease` and a `style-hover`; the
  desktop design gives it neither. Each file is authoritative on its own side
  of 900px, so the rule sits in the `max-width:899px` block.
- **The toggle's options are `<button>`s, not the design's `<span>`s**, with a
  `:focus-visible` ring the design has no equivalent for. A language switch has
  to be reachable from the keyboard. Nothing about the resting pixels changes —
  measured identical to the design at both widths.

- **The stack card's sheen is transitioned, which the design file does not
  do.** `design/HANDOFF.md` § Sheen hover gives the gesture one canonical CSS
  block — gradient, `background-size`, resting `140% 0`, hover `-60% 0` and
  `transition: background-position .72s cubic-bezier(.3,.7,.4,1)` — and names
  the stack card in the list of elements it applies to. The design file paints
  the gradient and moves it on hover but never transitions it: the card's one
  inline `transition` attribute is spent on the reveal, so the sweep snaps.
  Same shape as the preview crossfade's `.42s` — spec against prototype on one
  number the spec calls deliberate, and a sheen that does not sweep is not the
  gesture either document describes. The border warming to `#c9bfb7` is left
  to snap as the design file has it; no document gives that one a duration and
  inventing one is not a fidelity call.
- **`app/reveal.css` leaves an appendable slot, rather than exporting the
  transition as a custom property.** The stack card is the first block that is
  both a `[data-rv]` target and has its own hover transition, and a second
  `transition` declaration on the element replaces the reveal's rather than
  adding to it. The first fix tried was `--reveal-transition` on `:root`, read
  back by `[data-rv]`; it is wrong and was measured wrong — a custom property's
  `var()`s are substituted where the property is *declared*, so the bundle
  froze `--reveal-duration` and `--reveal-delay` at the root's values and
  silently dropped the phone's .8s and the about column's .12s stagger. What
  ships is a hole in the `[data-rv]` declaration itself,
  `var(--reveal-transition-extra, )`, which a block fills with a
  leading-comma list of its own transitions. Verified after the fix: the
  stagger is back at .12s on desktop and 0s on the phone, the phone durations
  are .8s again, and the card carries all three transitions on desktop and
  only the reveal pair below 900px.
- **Tool names are constants, not copy.** `HTML & CSS` … `Claude Code` are a
  hardcoded array in the design's own logic (`stack`, desktop line 546) and
  appear in neither dictionary; only the three group titles (`t.frontend` /
  `t.backend` / `t.infra`) and the kicker, heading and note are translated.
  Same call as the preview tab labels — translating `PostgreSQL` would be
  inventing copy.
- **The stack item row drops the design's `justify-content` and `gap`.** The
  row is `display:flex; align-items:center; justify-content:space-between;
  gap:16px` in the design (14px on a phone) and holds exactly one child, so
  both are inert; the row plainly once had a second column. Keeping them would
  be transcribing dead declarations. Zero pixels change.
- **Stack cards are keyed by index**, for the reason the work rows are: the
  group title is translated, so keying on it would remount every card on a
  language switch and lose the `data-revealed` the observer wrote to the DOM.
  Verified — after switching to Bulgarian the three card nodes are the same
  objects and all three keep their reveal.
- **`data-revealed` is written to the DOM, not held in React state.** React
  never rendered the attribute, so it does not diff it away — verified across a
  language switch in both directions, which re-renders the whole about grid.
  State would mean either a `Set` in a context every section subscribes to, or
  a hook per block; the design writes to the DOM and so does this.
- **Reveal distance and duration are `--reveal-shift` / `--reveal-duration` /
  `--reveal-delay`,** declared on `:root` in `reveal.css` at the about column's
  values (24px/.9s desktop, 20px/.8s phone). The design's other three blocks
  differ only in distance — work row 28px desktop / 22px phone, stack card and
  contact heading 22px / 20px — so each overrides the one property on itself
  when it is built. Two new tokens: `--duration-reveal-mobile` next to
  `--duration-reveal`.
- **Chrome honours the threshold; it does not fire on bare intersection.**
  Worth recording because the first two probes said otherwise: a single
  `scrollTo` jump straight past the threshold sometimes leaves the callback
  undelivered inside the tool's wait window, and both pages produced a false
  reading in *opposite* directions before the ladder was used. Step the scroll
  in small increments and compare the band, never one jump.
- **A property the phone design does not declare is gated out, not overridden
  back.** Two cases in `hero.css`, both in a `@media (min-width: 900px)` block
  rather than undone below 900: the CTAs' sheen (gradient + transition + two
  `:hover` rules — overriding only the gradient would have left the lift
  running) and the content column's `display:flex; flex-direction: column;
  align-items: center; max-width`, because `display:block` alone leaves
  `flex-direction` computing `column` on a box that is not a flex container
  and the dump stops matching. `work.css` and `stack.css` already gate their
  sheen this way; this is the same rule stated generally.
- **`stat3` / `stat3short` need no breakpoint split after all.** The pair is
  byte-identical in *both* dictionaries — "Open to freelance work" /
  "Свободна за проекти" either way — so the hero renders `stat3` alone. The
  count label and the contact footer are the real cases of that pattern.
- **The language toggle rewrites the URL; it does not navigate.**
  `window.history.replaceState` inside `switchLang`, which is the exact call
  Next's docs give for a locale switcher. `router.push`, `router.replace` or a
  real `<a>` would remount the tree mid-crossfade and throw away the scroll
  position under a `position:sticky` hero. The route segment is an *input* to
  `LangProvider` and never an output. Verified — see the step.
- **`dynamicParams = false`.** With it left at the default an unknown segment
  renders on demand, which is a server. Both locales are prerendered and
  everything else is a build-time 404.
- **No `lastModified` in the sitemap.** `new Date()` would stamp every entry
  with the build time and tell a crawler the page changed when only the deploy
  did. The honest value is the last content change and this build has no
  source for it.
- **The mock pages' webfonts are self-hosted, and that is not scope creep.**
  The three Trade Portal pages are iframed *live* into the work section, so a
  `fonts.googleapis.com` link in them is a third-party request on the
  portfolio's own critical path — the same thing the hotlinked Pexels photos
  were. `public/mock/assets/fonts.css` carries Google's own `@font-face`
  descriptors and unicode-ranges verbatim with local URLs; latin and latin-ext
  only, because the mocks contain no Cyrillic, Greek or Vietnamese (checked).
  Manrope's four fixed-weight blocks collapse to one `font-weight: 200 800`
  range: Google serves one variable file per subset for all of them, and the
  B2B homepage's 800 comes out of the same file.
- **The OG cards are PNGs rendered in a browser, not `next/og`.**
  `ImageResponse` needs the typefaces as font *files* and `next/font/google`
  exposes no stable path to them, so it would have meant a second copy of both
  fonts and an image runtime in a build that has neither. `tools/og/*.html`
  render in headless Chrome with the real Instrument Serif and Inter Tight;
  the PNGs are committed. The Bulgarian card's name falls back to a system
  serif because Instrument Serif ships no Cyrillic — which is exactly what the
  hero does on the page, so the card matching the site is the point, not a
  defect.

## Verifying a section

1. `npm run dev` (a server may already be up on `:3010`).
2. Serve the design over HTTP — `file://` is refused by the browser tool:
   `cd design && python3 -m http.server 4399`, then open
   `http://localhost:4399/Portfolio%20Atelier.dc.html`.
3. Screenshot both at 1440px and compare.
4. **Then measure, do not only look.** Run the same
   `getBoundingClientRect()` / `getComputedStyle()` dump on both pages and diff
   the numbers. Eyeballing passed the hero; measuring is what caught the
   line-height defect, which was 5px per element and invisible in a screenshot.

Four things that cost time when the measurement is scroll-driven:

- The design file sets `scroll-behavior:smooth`, so `scrollTo(0, y)` animates
  and reads back the wrong `scrollY`. Set `documentElement.style.scrollBehavior
  = 'auto'` at the top of the probe.
- `requestAnimationFrame` never fires in a background tab, and only one tab is
  foreground. Settle with `setTimeout` and dispatch `new Event('scroll')`
  yourself rather than waiting on a frame.
- Chrome clamps a window to 500px wide, so the 430px check actually runs at
  500. Still under 900, so the mobile branch is what is being measured.
- The build's page is far shorter than the design's while sections are empty, so
  the deep end of the scroll range clamps early. Append a tall spacer div to
  `body` for the probe and remove it afterwards.

Two more, from the language step:

- **Resizing the window did not take** — the tool reported success and
  `innerWidth` stayed 1440. To measure the mobile breakpoint, append a
  same-origin `<iframe style="width:500px;height:900px" src="/">`, wait for
  `onload`, and measure inside `contentDocument`: media queries answer to the
  iframe's width and `position:fixed` resolves to its viewport. Do the same on
  `:4399` against the mobile design file and the two dumps compare directly.
- **Transitions do not advance in a background tab**, so a computed value read
  after hovering is still the resting one and the rule looks broken. To check a
  `:hover` rule, set `el.style.transition = 'none'` while hovered, read, then
  put it back.

One more, from the tech stack step — worse than the two notes above and worth
reading before planning any scroll-driven measurement:

- **If the Chrome window is behind another app, the tab never renders**, and
  `javascript_tool` cannot bring it forward. `requestAnimationFrame` never
  fires, `setTimeout` is clamped to ~1s, and an IntersectionObserver delivers
  nothing — so a ladder of 16 steps at 80ms each blows the tool's 45s timeout
  and every block reads as unrevealed. `computer`'s screenshot *does* force a
  frame, and it takes **two** consecutive screenshots to see a reveal: the
  first runs the pending `rAF` that arms the observer, the second shows the
  lift it delivered. That is enough to prove a section reveals; it is not
  enough to ladder one. Bring the Chrome window to the front before a
  scroll-driven measurement, or measure the numbers (`--reveal-shift`,
  `transitionDuration`, `transitionDelay`) instead of the crossing.
- **Measure both pages in iframes of the same height.** The build's `#about`
  starts at exactly `100vh` (the hero is `min-height:100vh`), so an 800px-tall
  probe iframe against the design's 900px one puts every absolute `y` below the
  hero 100px apart and the diff looks like a broken section. All the relative
  geometry was identical; only the frame differed.

One more, from the preview step:

- **A tab that is not in the foreground never arms the reveal observer**, so
  every `[data-rv]` block reads as unrevealed and a screenshot comes back
  blank. `reveal.tsx` arms inside a `requestAnimationFrame`, which Chrome does
  not run in a background tab — the same trap as the settling note above, one
  step earlier in the sequence. `javascript_tool` does not foreground a tab and
  `computer`'s screenshot does, so a reload driven from JS lands in a hidden
  tab. For a screenshot, set `data-revealed` on every `[data-rv]` by hand
  rather than trying to scroll them into view.

Four more, from the work step — the browser extension was not connected, so
that session measured through headless Chrome instead. The harness was four
scratch files and is worth rebuilding rather than hunting for: a probe page
that iframes the target at a fixed width and measures inside
`contentDocument`, a second that runs the reveal ladder, a third that parks a
section at the top of the frame for a screenshot, and a tiny HTTP collector
the probe POSTs its JSON to — `--dump-dom` and `--screenshot` both fire on
load and cannot wait for async work, so the page has to hand its result back
itself. Serve the design through a directory that symlinks `design/` so the
probe and the target share an origin. Then:

- **Reach the build as `localhost:3010`, never `127.0.0.1:3010`.** Over the IP
  the page serves and styles correctly but never hydrates — no React handlers,
  no observer, no language switch — and every behavioural reading comes back
  false. Nothing is logged. Both design and build must be reached by the same
  host name for the two dumps to compare.
- **Wait for hydration before measuring behaviour, not just for markup.** The
  build's SSR HTML has `#work h3` in it long before React attaches, so a probe
  that waits on the markup measures a dead page. Poll for a `__react*` expando
  on an element instead. The design file has the opposite problem — it needs
  the CDN — and polling for the markup is right there.

Two more, from the mobile-hero step, which rebuilt that headless harness in a
much smaller form and is the version worth copying:

- **Put the probe in `public/` and symlink the design in beside it, then no
  collector is needed.** `ln -sfn ../design public/design` makes
  `localhost:3010/design/Portfolio%20Atelier%20Mobile.dc.html` same-origin with
  the build, so one page can iframe *both* at a fixed width and read both
  `contentDocument`s. Chrome's `--headless=new … --virtual-time-budget=30000
  --dump-dom` then waits for the CDN and the hydration poll and dumps the
  finished DOM, so the probe can write its JSON into a `<pre>` and be read
  straight out of the dump — no HTTP collector, no CDP client. **Delete the
  symlink and the probe pages afterwards**; they are in `public/`, which ships.
  Two gotchas: `--user-data-dir` must be fresh per run or a lingering Chrome
  holds the lock and the dump comes back empty, and a screenshot of the probe
  page at `w*2` gives the side-by-side comparison image for free.
- **The design's template runtime wraps every `{{ }}` hole in its own
  `<span>`.** So `h1 span` in a design file is the *first name*, not the italic
  surname, and `[data-scrollcue] span` is the label, not the rule. Both read as
  large false diffs. Take the last match, not the first.
- **A transition cannot be observed in headless.** No compositor frames means
  `getComputedStyle().opacity` sits frozen at the start value for the whole
  transition and `Animation.currentTime` never advances — so the
  `1 → .96 → .84 → … → .22` ladder the language step recorded is not
  reproducible there. What *is* observable, and is enough to prove a
  choreography intact: the inline value the handler writes (its target),
  `element.getAnimations()` (that the right CSSTransitions exist, on the right
  properties, for the right window, and are then removed), and `scrollY` /
  `history.length` / the swapped text either side.
- **Do not touch `<html>`'s style attribute before React attaches.** The probe
  set `scrollBehavior='auto'` on it at load; the root layout renders `<html>`,
  so that is a hydration mismatch. Set it after the hydration wait.
- **The design's template wraps every `{{ hole }}` in a `<span>`.** A probe
  that picks elements by "has no span inside" or counts `querySelectorAll('span')`
  reads the design wrong — tags came back doubled and the kind kicker came back
  missing. Select structurally instead (`h3.previousElementSibling`,
  `wrap.children`).

Three more, from the pinned bar step:

- **A smooth `scrollTo` does not advance without frames**, so a probe that
  clicks a nav link and reads `scrollY` a second later reads the *starting*
  offset and the handler looks dead. It is not — a `computer` screenshot
  forces a frame and the offset moves 8px. Do not ladder it. Stub
  `w.scrollTo` and assert on the argument instead: that is the number the
  handler computed, and it compares directly against the design's, whose own
  `scrollTop` write can be captured the same way with a
  `defineProperty` setter on `document.scrollingElement`.
- **The bar's link cannot be reached until the scroll handler turns the bar
  on**, so scroll past the threshold before probing it. What `inert` actually
  blocks was measured properly in the header step: real pointer input and
  focus, *not* `element.click()`, which still dispatches — see the note at the
  end of this section. A probe that asserts on `.click()` proves nothing either
  way.
- **Both pages measure to the same `scrollHeight` at 500px** — 6197 — and the
  same `#contact` offset, 5371.015625. Two free checks that the probe iframes
  are genuinely comparable before any of the per-element numbers are read.

Five more, from the contact step:

- **The slot's border warms to `#a8877c` on hover, which the design file does
  not do.** `design/HANDOFF.md` § Accompanying hover states names "tag pills
  and slots" together and gives them one gesture — `translateY(-2px)` plus the
  warm border. The design file's slot carries only the lift and the sweep in
  its `style-hover`, while still listing `border-color .2s ease` in a
  transition nothing else drives. Same shape as the preview crossfade's `.42s`
  and the stack card's sweep: the spec is read first and called authoritative,
  the prototype disagrees on one property, and the spec wins. One line to
  revert if that reading is ever overturned.
- **The selected slot keeps its sheen sizing, which the running design loses.**
  Both slot style strings declare `background-size:260% 100%;
  background-repeat:no-repeat; background-position:140% 0`, and § Sheen hover
  says the selected slot is one of the dark surfaces the `.30` gradient sweeps
  over. The design's runtime is React and its style diff only writes *changed*
  keys: selecting rewrites the `background` shorthand — which resets size,
  repeat and position — and then skips the three, because their declared values
  did not change. Proved rather than assumed: after selecting slot 0 and then
  selecting slot 1, the design's *unselected* slot 0 reads
  `background-size:auto; background-repeat:repeat`, which its own style string
  plainly forbids. A prototype artefact, not a design decision.
- **The slot buttons are flex containers**, `display:flex; align-items:
  flex-start; justify-content:center`. The design's selected slot declares no
  border, and the grid stretches every cell to the row height, so its label
  sits 1px higher than its neighbours': measured 13px from the box top selected
  against 14px unselected on desktop, 14 against 15 on the phone. A `<button>`
  centres its content vertically and `align-items` on the button alone does not
  override that in Chrome — making it a real flex container does. Without the
  three declarations the build read 14 (and 15) in both states. Buttons rather
  than the design's divs for the reason the toggle's options and the preview's
  tabs are: picking a time is a control the keyboard has to reach.
- **On the phone the 18px above the echoed slot rides on the echo, not on the
  row.** The design renders that block only when a slot is picked; the build's
  row is always in the tree, and an empty flex container does not collapse its
  margins through in Chrome. Measured before the fix: the footer, the footer
  note and the section's own height were all 18px out whenever no slot was
  selected. With the margin on `.contact__picked` both states match the design
  exactly — 826.09px section unselected, 859.59px selected, at 500px.
- **The header's 8px / 10px slide is removed under reduced motion, and the
  design's is not.** It is the third gesture of the shape the audit ruled on:
  it crosses a threshold and then animates itself over .4s, exactly like the
  booking bar's 16px, so the same answer applies — the travel goes, the fade
  stays. Both halves are needed, the resting rule in `app/header.css` and the
  `lift` the handler writes, or the bar animates its 8px once on mount as the
  handler's first write transitions away from the CSS resting value. Measured
  under an emulated preference at 1440 and 430: the transform is
  `translateY(0)` in both the hidden and the shown state, and the opacity still
  crosses 0 → 1 at the threshold.

- **The header's `.4s` stays a literal, like the bar's `.35s` and the toggle's
  `.24s`.** It is slower than every micro token and faster than the reveal,
  fits none of them, and drives one element.

- **`navAt` / `navLift` / `navCentred` joined `Tuning`; the bar's two constants
  did not.** The rule is whether the two design files disagree: they give the
  header .55 against .5, 8px against 10px, and a full-bleed bar against a
  centred 440px one, so all three are read per event off the same `matchMedia`
  the hero's five are. `BAR_AT` and `BAR_LIFT` stay module constants because
  the desktop design has no bar to disagree about.

- **The phone header's glass is `--color-glass-toggle`.** The token is named
  for the language toggle, which is where the .86 was first met; the phone
  header uses the same alpha, and the desktop header's own .74
  (`--color-glass-header`) is a third value. Three glass surfaces, three
  tokens, and one of them is shared by two elements — not worth a fourth token
  spelling the same colour.

- **The nav links get no sheen, and that is the design file, not an
  omission.** `design/HANDOFF.md` § Sheen hover opens its list of elements
  with "nav links", but the desktop file's three links carry only
  `transition:color .22s ease,box-shadow .26s ...` and a `style-hover` of
  `color:#2e2523;box-shadow:inset 0 -1px 0 #a8877c` — which is exactly what
  the spec's own *Accompanying hover states* bullet gives them. This is not
  the shape of the preview crossfade, the stack card's sweep or the slot's
  border, where the prototype left a dead transition behind and the spec
  supplied the missing half: there is no orphaned `background-position` in the
  nav link's transition list, so nothing was dropped. The link beside them,
  book-a-call, does carry the gradient — the file distinguishes them
  deliberately. Recorded here so the header step does not have to re-derive it.
- **The sheen is custom properties, not a shared `.sheen` class.** The
  duplication the class would remove is the gradient and the sweep's
  duration/easing, and a property removes exactly that. What is left is
  per-element and would have to be undone as often as the class was applied:
  the resting position is 140% on the wide elements and 135% on the two narrow
  ones, each element's `transition` also carries its own colour, border or
  lift, and two of the seven run the gesture only above 900px. A class also
  ties on specificity with the three rules that override its `background-image`
  for a dark surface (`.langtoggle__opt--active`, `.contact__slot
  [aria-pressed='true']`, and the solid CTA), which would make the resting fill
  depend on stylesheet import order. Reasoning is in the head of
  `app/sheen.css`.
- **`jumpTo` drops two lines the design's handler carries, both host
  artefacts.** The first is the loop that walks ancestors looking for whichever
  one actually scrolls — the design was authored inside a host that may nest
  the page in a scroller, and nothing in this build scrolls but the document,
  so the loop can only fall through to the document branch already below it.
  The second is the trailing `doc.scrollTop = top`, which runs *unconditionally
  and after* `scrollTo({behavior:'smooth'})` and so cancels the smooth scroll
  the line above it just started: the running design jumps. `CLAUDE.md`
  § detail 5 and `design/HANDOFF.md` § Scroll behaviour both ask for smooth.
  Spec over prototype, the same call as the preview crossfade's `.42s`. Proved
  rather than assumed — the design's `scrollTo` argument and its `scrollTop`
  write were both captured, and they name the same pixel.
- **The href stays on the anchor under every jump handler.** The design keeps
  it too. It is what a middle-click, a "copy link address" and a JS-off load
  use; the handler only takes the click.
- **The booking bar renders at both breakpoints and is hidden above 900px**,
  the call the hero's `stat3` pair, the work count label and the contact
  footer already made. It is the one element with no desktop spelling at all —
  the desktop design has no `[data-bookbar]` — so `app/bookbar.css` is written
  phone-first with a `min-width:900px` block that hides it, rather than the
  usual base-is-desktop split. Above 900px the handler's writes land on a
  `display:none` element and are inert.
- **The bar's two `<sc-if>` branches collapse to one anchor.** The design
  spells the picked and unpicked states as two complete, identical anchors
  differing only in `href` / `target` / `onClick`; they are derived props here,
  the same reduction the language toggle's four branches got.
- **The bar's `.35s` stays a literal, like the toggle's `.24s`.** It sits
  between `--duration-micro-slow` and `--duration-preview`, fits no token, and
  drives one element. The reveal's durations became tokens because they differ
  by breakpoint and are read from several files; this does neither.
- **The bar's threshold is not part of `Tuning`.** `useHeroParallax` reads its
  five per-breakpoint numbers off a `matchMedia`; `BAR_AT` (.85) and
  `BAR_LIFT` (16) are module constants instead, because the desktop design has
  no bar to disagree about.
- **The confirm pill darkens to `#423a36` on hover and the hero's solid CTA
  does not.** Both carry `style-hover="background:#413830"`-shaped attributes,
  but the hero's is a *second* `style-hover` on the same element and the parser
  drops it; the confirm pill's is its only one. Untransitioned, as the design
  has it — no document gives that one a duration.

One more, from the reduced-motion audit — the only measurement so far that the
browser extension cannot take at all:

- **`prefers-reduced-motion` cannot be emulated from the extension**, and it
  cannot be faked from page JS either: `matchMedia` is read-only, so a probe
  that stubs it measures the stub. Flipping the macOS system setting to test a
  build is not a reasonable ask. What works is CDP —
  `Emulation.setEmulatedMedia` with `features: [{name:
  'prefers-reduced-motion', value: 'reduce'}]` — which toggles the real
  preference on a live page, so both states are measurable in one session
  without a relaunch. Node 22 has a global `WebSocket`, so the driver is about
  60 lines with no dependencies: spawn Chrome with `--headless=new
  --remote-debugging-port=… --user-data-dir=…`, poll `/json/list` for the page
  target, open its `webSocketDebuggerUrl`, then `Page.enable` / `Runtime.enable`
  and drive with `Runtime.evaluate` (`awaitPromise:true`,
  `returnByValue:true`). `Emulation.setDeviceMetricsOverride` gives the two
  widths without fighting Chrome's 500px window clamp — this is the first
  session that measured a real 430px, though 500 was used to stay comparable
  with earlier steps. The headless page also runs `requestAnimationFrame` and
  delivers IntersectionObserver callbacks normally, so none of the
  foreground-tab traps above apply. Reuse this rather than the extension for
  anything media-query-dependent.
- **Assert on the emulation before trusting the numbers.** Every dump carries
  `matchMedia('(prefers-reduced-motion: reduce)').matches`; without it a
  `setEmulatedMedia` that silently did not apply reads as "the rule does
  nothing" rather than as a broken probe.
- **Sample a transition over time to tell a fade from a flash.** The end
  states are identical — both arrive at `.22` and `blur(1.5px)` — so a single
  computed read cannot distinguish them. Click the toggle and sample opacity
  every ~22ms for 14 frames: a fade walks 1 → .96 → .84 → .67 → … and a flash
  is at `.22` on the second sample.

One more, from the header step:

- **The CDP driver is the whole harness now, not just the reduced-motion one.**
  The same 60 lines drive the design file on `:4399` and the build on
  `:3010` in one run — navigate, wait for hydration (`__react*` expando) or for
  the design's markup, `Emulation.setDeviceMetricsOverride` for the width, dump
  both, diff the flattened objects. It also gives real hover, which page JS
  cannot: `Input.dispatchMouseEvent` with `type:'mouseMoved'` at an element's
  centre fires the actual `:hover`, and the design's `style-hover` attributes
  resolve through `support.js` the same way, so the two hover states compare
  directly. Headless runs frames normally, so none of the foreground-tab traps
  above apply and a scroll ladder settles. Same for `inert`: a real
  `mousePressed`/`mouseReleased` pair proves a click does not reach a hidden
  control, where a programmatic `.click()` proves nothing — it still dispatches
  through `inert`.
