# Developer portfolio

A single-page bilingual portfolio — English and Bulgarian — for Daniela Georgieva,
full stack developer, Plovdiv.

One continuous scroll: hero, about with education and languages, three project case
studies with interactive previews, tech stack, and a contact section with a time-slot
picker that hands off to Google Calendar.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS.

## Getting started

```bash
pnpm install
pnpm dev
```

## Layout

| Path | Contents |
| --- | --- |
| `content/copy.ts` | All site copy, both languages |
| `design/` | Design reference for the build — not shipped |
| `public/images/` | Portrait and project screenshots |
| `public/mock/` | Standalone mock portal pages used inside the project previews |

## A note on the project previews

The portal pages under `public/mock/` are mockups built for this portfolio. Brand names
and product copy have been substituted, and every figure in them — prices, warranties,
review quotes, company and VAT numbers — is an invented placeholder. They stand in for
client work that cannot be shown directly.

## Licence

Code is free to read and learn from. The copy, photography and portrait are not.
