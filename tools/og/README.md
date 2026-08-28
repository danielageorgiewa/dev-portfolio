# Social card and app icon sources

Not part of the site build. These three files are the *sources* of three
committed PNGs, kept so the images can be regenerated rather than redrawn:

| Source | Output | Size |
| --- | --- | --- |
| `icon.html` | `app/icon.png` | 512×512 |
| `og-en.html` | `public/og-en.png` | 1200×630 |
| `og-bg.html` | `public/og-bg.png` | 1200×630 |

Why PNGs rather than `next/og` at build time: `ImageResponse` would need the
two typefaces as font *files*, and `next/font/google` gives no stable path to
them. Rendering in a real browser gets the actual Instrument Serif and Inter
Tight, and leaves the build with no image runtime at all.

The name and role in the cards are `first`, `last` and `role` from
`content/copy.ts`, in that language — pasted from it, never rewritten. If that
copy changes, change it here too. The Bulgarian name falls back to a system
serif because Instrument Serif ships no Cyrillic, which is exactly what the
hero does on the page; the card matching the site is the point.

## Regenerating

They load the portrait by relative path and the fonts from Google, so they
render straight off disk — no dev server:

```sh
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless=new --hide-scrollbars --window-size=512,512 \
  --virtual-time-budget=15000 --screenshot=app/icon.png tools/og/icon.html
"$CH" --headless=new --hide-scrollbars --window-size=1200,630 \
  --virtual-time-budget=15000 --screenshot=public/og-en.png tools/og/og-en.html
"$CH" --headless=new --hide-scrollbars --window-size=1200,630 \
  --virtual-time-budget=15000 --screenshot=public/og-bg.png tools/og/og-bg.html
```

`--virtual-time-budget` is what waits for the webfonts; without it the cards
render in the fallback stack.
