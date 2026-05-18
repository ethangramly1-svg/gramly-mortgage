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

We are currently at **phase 08 — Detail pages (dossier, index, about,
contact)**, complete. Phases 09–10 fill in Clerk auth + Resend wiring
and Turso persistence.

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

## ScrollVideo hero (phase 04)

`app/components/ScrollVideo.tsx` is the cinematic hero. It paints a
sequence of pre-decoded WebP frames onto a `<canvas>`, with the frame
index driven by scroll position. Mounted as the first element of
`app/(site)/page.tsx`:

```tsx
<ScrollVideo heightVh={220} />
```

### Why canvas, not `<video>`

`<video>` can't be scrubbed reliably — Safari refuses to seek inside
HLS chunks during scroll, Chrome decodes asynchronously and falls
behind. Pre-decoded frames painted to canvas scrub at 120Hz because
the paint itself is essentially free.

### Frame tiers

The component picks one of three frame folders based on viewport +
DPR at mount time:

| Tier         | Trigger                       | Folder                       | Count |
|--------------|-------------------------------|------------------------------|-------|
| `mobile`     | viewport width < 768          | `public/frames/mobile/`      | 31 (every 2nd)  |
| `desktop-1x` | width ≥ 768 and `w*dpr < 2000` | `public/frames/desktop-1x/`  | 61    |
| `desktop-2x` | width ≥ 768 and `w*dpr ≥ 2000` | `public/frames/desktop-2x/`  | 61    |

Mobile also collapses the spacer from `heightVh` (default 220) to
160vh — same animation in less scroll, less bandwidth.

Frames are generated from `docs/cinematic-reference.md`'s source video
via ffmpeg → JPG → cwebp. Regenerate with:

```bash
brew install webp                  # if cwebp missing
brew install ffmpeg                # if ffmpeg missing
# then run the extraction loop documented in the phase-04 commit
```

### Hot-path discipline

The scroll handler runs ~60×/sec. **It never calls `setState`.**
Every per-frame DOM mutation goes through a ref + cached "last applied
value" check, so duplicate writes get short-circuited. The only React
state lives on the loading splash, which renders once and then never
again.

## CollectionOverture (phase 05)

`app/components/CollectionOverture.tsx` is the second beat of the home
page — a pinned aperture-reveal transition between `<ScrollVideo>` and
`<PortfolioStack>`. Mounted directly after ScrollVideo in
`app/(site)/page.tsx`.

### Behavior

- **Desktop (≥ 768px):** GSAP `matchMedia` gates a timeline that pins
  the section for `+=220%` of scroll. The image clip-path animates
  from a horizontal slit (`inset(49% 18% 49% 18%)`) to full-bleed
  (`inset(0%)`), the image scales `1.5 → 1.02`, two ghost words
  ("LENDING" + italic "without friction") drift in opposite directions,
  eyebrow rules scale-X in, corner brackets stagger-fade, and a
  one-shot horizontal gold flare blinks the moment the slit opens.
- **Mobile (< 768px):** the timeline does not run. The section renders
  statically — image full-bleed, caption visible below, no pin.

### Load-bearing details

1. **Outer `<div className="relative">` wrapper.** GSAP's pin-spacer
   wraps the section once it pins. On route change, React tries to
   `removeChild` the section from its expected parent and throws
   "Node not a child of this node" unless that parent is an
   invariant React-owned wrapper.
2. **`md:` prefix on every initial-hidden Tailwind class.** Every
   `opacity-0`, `scale-x-0`, `[clip-path:inset(...)]` only applies at
   md+ so the mobile fallback never shows an invisible image.
3. **`gsap.matchMedia` + `ctx.revert()` cleanup.** Tearing down the
   timeline on unmount or matchMedia mismatch (e.g. resizing to mobile
   mid-page) avoids ScrollTrigger orphan instances. **Do not** swap
   this pattern for `@gsap/react`'s `useGSAP()` hook — it abstracts
   the cleanup we need.

### What plays into what

| Placeholder concept       | Mortgage realisation         |
|---------------------------|------------------------------|
| Section headline          | "Lending, refined"           |
| Ghost word (primary)      | LENDING                      |
| Ghost word (echo, italic) | without friction             |
| Caption (strong)          | "A modern lender."           |
| Caption (soft, bone/45)   | "Las Vegas."                 |
| Right-side meta           | "36.169° N · 115.140° W"     |
| Signature image           | `/assets/penthouse-2.jpg`    |

## PortfolioStack (phase 06)

`app/components/PortfolioStack.tsx` — the third beat of the home page.
A pinned full-viewport stack where N cards slide up over each other,
one viewport at a time.

### Behavior

- **Desktop ≥ 768px:** GSAP `matchMedia` pins the section for
  `N × innerHeight` of scroll. Each successive card animates
  `yPercent: 100 → 0` across its own viewport-height slice. `zIndex`
  grows with index so later cards visually cover earlier ones.
- **Mobile:** cards render as a flowing vertical list — no pin, no
  scrub. (Pinning + scrubbed `yPercent` on touch is brutal.)
- **`invalidateOnRefresh: true`** on the ScrollTriggers — start/end
  formulas reference `window.innerHeight`, which changes on mobile
  Safari when the address bar collapses.

### Items data (`app/lib/items.ts`)

Five mortgage programs are defined in `ITEMS`:

| Slug          | Index       | Cover image                       |
|---------------|-------------|-----------------------------------|
| `jumbo`       | Jumbo       | `/assets/penthouse-1.png`         |
| `conventional`| Purchase    | `/assets/penthouse-4.png`         |
| `refinance`   | Refinance   | `/assets/penthouse-3.jpg`         |
| `investment`  | Investor    | `/assets/penthouse-5.png`         |
| `government`  | First home  | `/assets/home-financing-hero.png` |

`jumbo` is featured in the hero (ScrollVideo's CTA points to `/jumbo`)
and filtered out of the stack in `app/(site)/page.tsx`. The stack
renders 4 cards. Each card links to `/${slug}` — the detail pages
arrive in phase 08.

### Card structure

Each card is a 12-column grid with the cover image (col-span-8) and
a metadata column (col-span-4). Odd-indexed cards reverse direction
via `md:[direction:rtl]` on the grid + `md:[direction:ltr]` on each
column — the *visual* order flips without re-ordering the DOM, which
keeps tab order and a11y intact.

The metadata column always has the same five things in the same
positions: location with leading hairline, large display name,
subtitle, three-metric row with a hairline top + bottom, and the
"Guide price + Dossier →" pairing. **Do not move the price/Dossier
pairing.** It's the conversion moment.

## Connective tissue (phase 07)

Five small components that make the site feel like a site:

| Component                          | Role                                                    |
|------------------------------------|---------------------------------------------------------|
| `app/components/Reveal.tsx`        | IntersectionObserver fade-up. Wrap blocks, not inlines  |
| `app/components/Navbar.tsx`        | Fixed top, scroll-aware, mobile drawer, locks body      |
| `app/components/Footer.tsx`        | Brand colophon + Pages + Reach + copyright row          |
| `app/components/FooterMarquee.tsx` | Horizontal brand-wordmark band above the footer         |
| `app/components/Correspondence.tsx`| Home-page contact section (§ v)                         |
| `app/components/ContactForm.tsx`   | Form used in Correspondence + the /contact page         |
| `app/components/Carousel.tsx`      | Horizontal snap-scroll gallery (used by phase 08)       |

### Navbar / Programs active-state derives from items.ts

The navbar's "Programs" link is active when the user is on `/${slug}`
for any item in `ITEMS`. The slug list is derived at import time:

```ts
const programSlugs = ITEMS.map((i) => `/${i.slug}`);
```

Add a 6th program tomorrow, navbar active-state picks it up. No
manual sync.

### Contact form is offline until phase 09

`ContactForm.tsx` currently `console.log`s submissions and shows a
"Thank you" frame. Phase 09 replaces the body of `handleSubmit` with
a `fetch("/api/contact", ...)` call. The form fields, validation,
and "Received" UI stay; only the network call changes.

### Carousel honors data-lenis-prevent

The carousel's scroller has `data-lenis-prevent` so Lenis (phase 02)
doesn't intercept horizontal wheel events. Without that attribute,
Lenis translates side-scroll into vertical and the carousel becomes
unscrollable on a trackpad.

### Compliance footnote

Footer's bottom-right shows `NMLS 1984074`. This is required by
California and Nevada lender-disclosure rules — it's not stylistic.
If the broker's NMLS changes, update `app/components/Footer.tsx`.

## Detail pages (phase 08)

Four secondary routes under `app/(site)/`:

| Route                       | Page                                | Purpose                          |
|-----------------------------|-------------------------------------|----------------------------------|
| `/programs`                 | `programs/page.tsx`                 | Index — grid of all 5 programs   |
| `/programs/[slug]`          | `programs/[slug]/page.tsx`          | Dossier per program (5 static)   |
| `/about`                    | `about/page.tsx`                    | Practice / bio / origin          |
| `/contact`                  | `contact/page.tsx`                  | Standalone contact form          |

### URL convention

Items live at `/programs/{slug}` (e.g. `/programs/jumbo`). Phase 06's
`/${slug}` convention was corrected here — the index page needs a
folder, and `/programs/` is the cleaner namespace anyway. Three
existing files were updated to match: `Navbar.tsx`, `Footer.tsx`,
and `PortfolioStack.tsx` card hrefs.

### Static generation

Dossier pages use `generateStaticParams()` to pre-render all 5
slugs at build time. `next build` reports `● (SSG)` for the
`[slug]` route group, and Vercel ships them as static HTML — same
serving model as a static-site generator.

### Form is offline until phase 09

The contact form is now duplicated in **three places**:
`Correspondence` (home), the dossier `#correspondence` section, and
`/contact`. All three call the same `<ContactForm />` component;
phase 09 replaces the `console.log` body of `handleSubmit` with a
single `fetch("/api/contact", ...)` call. Updating one component
updates all three call sites.

### Items.ts is now narrative-rich

Each `Item` carries a `description: string[]` of 2–3 paragraphs and
a `region` field. Dossier pages render these as the "§ Notes" block
and inside the "§ Specifications" grid respectively. The paragraphs
are written in a real broker's voice and reviewed for compliance —
no rate guarantees, no "lowest rates" claims, no implied suitability.
Replace them through `app/lib/items.ts` (not on the dossier pages
themselves).

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
