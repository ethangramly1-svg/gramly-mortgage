# Chris Gramly · Clear Modern Mortgage — Engineering Notes

Cinematic, editorial single-page site for a Las Vegas mortgage advisor.
Scroll-scrubbed hero video, pinned-stack sections, smooth scroll, dark
warm-ink background with brass gold accents.

## Project state

This repo was bootstrapped through a Three.js/Vite cinematic and then
reset to **Next.js 16 + React 19 + Tailwind v4** under an 11-phase
foundation plan. This file documents the current (Next.js) stack. The
legacy Vite + React 18 + Three.js notes are preserved at
`docs/CLAUDE.vite-legacy.md` for reference but **do not describe what
the working tree contains now**.

We are currently at **phase 03 — Design Tokens & Type Scale**, complete.
Phases 04–10 fill in hero video, portfolio stack, navbar/footer, Clerk
auth, Resend forms, and Turso persistence — in that order.

## Stack

- **Framework**: Next.js 16.2.4 (App Router)
- **React**: 19.2.4
- **Language**: TypeScript 5
- **Styles**: Tailwind v4 (CSS-first config via `@theme` in `app/globals.css` — no `tailwind.config.ts`)
- **Smooth scroll**: Lenis 1.3.23 + GSAP 3 ScrollTrigger
- **Package manager**: pnpm
- **Deploy**: Vercel (configured in a later phase)

This is **Next.js 16**, not the Next.js most tutorials describe. Key
moved-or-renamed APIs:

- `middleware.ts` no longer exists at the app root — it is now
  `proxy.ts`. Same API surface, new filename. Clerk integration uses
  `clerkMiddleware()` inside `proxy.ts` (phase 09).
- For anything that touches Next.js APIs (Link prefetching, fonts,
  metadata, server actions, route handlers, image), open
  `node_modules/next/dist/docs/` and read the in-repo docs before
  writing code. They override anything an external tutorial says.

## File layout

```
.
├── package.json
├── tsconfig.json              # paths: @/* → ./*
├── next.config.ts
├── postcss.config.mjs         # @tailwindcss/postcss only
├── eslint.config.mjs          # extends next/core-web-vitals + next/typescript
├── .gitignore
├── .env.local                 # populated in phases 09–10
├── proxy.ts                   # empty stub; Clerk lands here in phase 09
├── app/
│   ├── layout.tsx             # root: fonts, metadata
│   ├── globals.css            # Tailwind import + base html/body colors
│   ├── (site)/
│   │   ├── layout.tsx         # SmoothScroll mount + header/main/footer
│   │   └── page.tsx           # placeholder home
│   ├── components/
│   │   └── SmoothScroll.tsx   # the single scroll authority
│   └── lib/
│       └── utils.ts           # cn() helper
├── public/                    # brand assets (chris-gramly.png, logo, …)
└── docs/
    ├── CLAUDE.vite-legacy.md  # frozen notes from the old Three.js stack
    └── cinematic-reference.md # Higgsfield reference video pointer
```

**Path imports**: `app/lib/` and `app/components/` live **inside** `app/`,
not at the repo root. All imports go through `@/app/lib/…` and
`@/app/components/…`. `tsconfig.json` configures `@/* → ./*`.

## Fonts

Three Google fonts via `next/font/google`, all with `display: "swap"`:

| Role    | Family             | Weights                     | CSS variable      |
|---------|--------------------|-----------------------------|-------------------|
| Display | Cormorant Garamond | 300, 400, 500, 600, 700     | `--font-display`  |
| Body    | Inter              | 300, 400, 500, 600          | `--font-body`     |
| Mono    | JetBrains Mono     | 300, 400, 500               | `--font-mono`     |

Note: Cormorant Garamond doesn't ship 200 or 800 weights even though
the phase prompt asked for them; the available range is 300–700. If
you ever try to add 200 or 800 to the weight array, `next build`
fails — that's the constraint, not a bug.

## Design system (phase 03)

Tailwind 4 is CSS-first. There is **no** `tailwind.config.ts`. Tokens,
component classes, and animations all live in `app/globals.css`.

### Tokens (`:root` + `@theme inline`)

| Group  | CSS variable     | Hex / value                                  |
|--------|------------------|----------------------------------------------|
| Ink    | `--ink`          | `#0f0b06` (warm espresso, not pure black)    |
|        | `--ink-soft`     | `#181108`                                    |
|        | `--ink-panel`    | `#1f1709`                                    |
| Gold   | `--gold`         | `#d4b46a` (the one chromatic accent)         |
|        | `--gold-bright`  | `#ecd28c`                                    |
|        | `--gold-mid`     | `#c2994d`                                    |
|        | `--gold-deep`    | `#967135`                                    |
|        | `--gold-ember`   | `#5a4420`                                    |
| Bone   | `--bone`         | `#ece3cc` (warm cream foreground)            |
|        | `--bone-dim`     | `rgba(236, 227, 204, 0.55)`                  |
| Line   | `--line`         | `rgba(212, 180, 106, 0.22)`                  |
|        | `--line-strong`  | `rgba(212, 180, 106, 0.40)`                  |

The accent is called **gold** in code regardless of whatever the brand
color is — it's the project's name for the one chromatic accent across
all sites in this family. Don't rename it.

### Design philosophy

1. **Warm ink, not black.** Background is `#0f0b06` with two soft
   radial gold spots layered on top.
2. **Accent used like a knife.** Gold appears only in hairlines,
   eyebrow micro-labels, focused input underlines, one CTA button,
   gradient-text moments, hover affordances. Never as a card fill.
3. **Three fonts, three weights — not the Tailwind preset ladder.**
   Display 200–300 at huge sizes (clamp 3rem–9vw). Body 300–400. Mono
   300–400 at 0.55–0.68rem with 0.22–0.4em letter-spacing, uppercase.
4. **Hairlines and brackets, not cards.** No shadows, no rounded
   rectangles, no card components. Structural language is typographic.

### Component classes (all in `globals.css`)

| Class             | What it is                                                  |
|-------------------|-------------------------------------------------------------|
| `.eyebrow`        | Mono micro-label in gold, `0.28em` tracking, uppercase      |
| `.eyebrow-sm`     | Tighter variant — `0.24em` tracking, `0.6rem`               |
| `.hairline`       | 1px horizontal rule — fade-in-out gradient gold             |
| `.hairline-v`     | Same, vertical                                              |
| `.gold-text`      | Gradient-text for one or two display words                  |
| `.gold-shine`     | Animated gold shine — use sparingly                         |
| `.noise::before`  | Full-bleed SVG turbulence overlay (desktop only)            |
| `.frame`          | Corner-bracket frame (needs `<.frame-tr/>` `<.frame-bl/>`)  |
| `.btn-gold`       | Primary CTA — gold border, gradient sweep on hover          |
| `.btn-ghost`      | Secondary CTA — mono caps, widens on hover                  |
| `.input-field`    | Bottom-border-only input, lights gold on focus              |
| `.reveal`         | Animation hook for `<Reveal>` (phase 07)                    |
| `.fade-up`        | One-shot CSS-driven entry — used inside ScrollVideo hero    |
| `.glow-hover`     | Hover ring + soft gold drop shadow                          |
| `.vertical`       | `writing-mode: vertical-rl` rotated 180                     |
| `.serif-nums`     | `font-variant-numeric: tabular-nums`                        |
| `.blink`          | 1.2s steps blink                                            |
| `.marquee`        | 50s linear `translateX(-50%)` loop                          |

### Mobile drops the noise overlay

The `.noise::before` element is `position: fixed` + `mix-blend-mode:
overlay`, which forces a full-viewport composite every scroll frame.
A `@media (max-width: 767px)` rule sets `display: none` on it. This is
load-bearing — without it, touch scroll stutters.

## SmoothScroll

The single source of scroll authority. Lives at `app/components/SmoothScroll.tsx`
and is mounted once in `app/(site)/layout.tsx`. Contract:

- Mounts a Lenis instance on desktop only. Touch devices (`pointer:
  coarse`) and `prefers-reduced-motion: reduce` skip mounting — native
  scroll takes over. Touch + Lenis + pinned GSAP timelines produces
  jank that costs more than the smooth scroll buys.
- Bridges Lenis ↔ GSAP: `lenis.on("scroll", ScrollTrigger.update)`,
  `gsap.ticker.add((t) => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`.
- Exposes the instance on `window.__lenis` (typed via `declare global`).
- Intercepts clicks on `a[href^="#"]` and `a[href*="/#"]` whose target
  exists in the current document and runs `lenis.scrollTo(target, { offset: -80, duration: 1.4 })`.
- On every route change after first mount: stops in-flight scroll,
  scroll-to-hash if the URL has one (rAF-deferred so the new page can
  mount), otherwise hard-resets to top. Then `ScrollTrigger.refresh()`
  so any pinned section in the new page binds to the new geometry.

The route-reset block matters: Next.js 16 Link preserves scroll
position by default when the next page is visible, which on
same-background pages leaves you mid-scroll with pinned sections in
broken states.

## Scripts

```bash
pnpm install
pnpm dev      # next dev — http://localhost:3000
pnpm build    # next build — production check
pnpm start    # next start — serve the build
pnpm lint     # next lint
```

## Cinematic reference

A Higgsfield-generated reference video (sky → white penthouse → sky →
second penthouse) is documented at `docs/cinematic-reference.md`. The
hero scroll-video in phase 04 will either use that clip directly or
re-generate against the same prompt. The reference itself is not
committed (working asset, not a deployed artifact).

## Don'ts

- Do not `npx create-next-app` — it pulls templated defaults that
  conflict with the file tree above.
- Do not add `tailwind.config.ts` — Tailwind 4 is CSS-first.
- Do not install Clerk / Resend / `@libsql/client` / `tsx` yet.
  Those land in phases 09–10.
- Do not import from `pages/`. App Router only.
- Do not add `<header>` / `<footer>` real content yet. They're stubs
  until phase 07.
