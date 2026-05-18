# Chris Gramly · Clear Modern Mortgage — Engineering Notes

This is a Vite + React + TypeScript single-page site that wraps a single
`<Canvas>` (`@react-three/fiber`) with a cinematic scroll-bound 3D
experience. Below the cinematic hero are real, navigable mortgage
sections (about, purchase, refinance calculator, resources, contact form).

## Stack

- **Build**: Vite 6, TypeScript 5
- **UI**: React 18
- **3D**: `three` 0.171, `@react-three/fiber` 8, `@react-three/drei` 9, `@react-three/postprocessing` 2
- **Animation**: `gsap` 3 + `@gsap/react` + ScrollTrigger
- **Fonts**: Cormorant Garamond (display serif) + Inter (UI sans), Google Fonts
- **Deploy**: GitHub Pages via Actions, base path `/ChrisGramlyMortgage/`

## File layout

```
index.html                 # Vite entry, loads /src/main.tsx
src/
  main.tsx                 # React root
  App.tsx                  # Page composition
  components/
    canvas/
      CanvasRoot.tsx       # Single <Canvas>, fixed full-viewport
      scenes/
        SceneSky.tsx       # Scene 1: sky intro / hero
        Scene<Next>.tsx    # Each new scene is its own file
    site/
      Header.tsx           # Sticky nav, light theme
      Footer.tsx
      About.tsx
      Purchase.tsx
      Refinance.tsx        # Includes mortgage calculator
      Resources.tsx
      Contact.tsx          # Profile card + form
  lib/
    scroll.ts              # ScrollProvider, useScroll, ScrollTrigger setup
    pageBounds.ts          # Scene Y-ranges + progress lookups
    palette.ts             # Color tokens shared between CSS + JS
  styles/
    globals.css            # CSS resets, tokens, light base styles
  types/
    drei.d.ts              # Ambient types if drei JSX is missing
public/
  assets/                  # Existing brand assets: photo, logo, hero, svg
legacy/                    # Pre-scaffold static site, preserved for reference
.github/workflows/pages.yml
```

## Single Canvas convention

There is exactly **one** `<Canvas>` in the whole app, mounted by
`CanvasRoot.tsx` and positioned `fixed; inset: 0; pointer-events: none`.
Each scene is a React component placed inside it (visible only while its
scroll range is active).

Why: every additional Canvas allocates a WebGL context, kills shared
state, and tanks mobile performance.

If you need a "different scene" you build a new component in
`components/canvas/scenes/` and reveal/hide it via the scroll context.

## Scroll context (`lib/scroll.ts`)

- A single ScrollTrigger covers `<main>`'s height. Its progress (0→1)
  is exposed via `useScroll()` (subscribe pattern, not React state — we
  do not want every frame to trigger a React render).
- Each scene reads progress in its `useFrame` and computes its own
  local 0→1 based on `pageBounds.ts`. Example: SceneSky owns the first
  100vh, so its local progress = clamp((globalY - 0) / vh, 0, 1).
- 2D copy overlays use GSAP timelines whose `progress()` is set from the
  same global scroll value — that way scroll-up reverses the animation.

## Animation rules

- **Bind to scroll, not to time** — every reveal/transition is driven by
  the scroll context. No `setTimeout`, no autoplaying intro that finishes
  on a clock.
- **All animations reversible** — scrolling up must undo everything that
  scrolling down did. No one-shot `.add()` to a timeline that doesn't
  reverse.
- Camera moves use cubic ease-in-out via small helpers in scenes (no
  GSAP for camera position — it's just a `useFrame` lerp).

## Palette

| Token            | Hex       | Use                                                |
|------------------|-----------|----------------------------------------------------|
| `--paper`        | `#f6f0e4` | Warm cream background for light sections           |
| `--paper-sub`    | `#ece4d2` | Section dividers / subtle bands                    |
| `--ink`          | `#0a1224` | Body text on light                                 |
| `--ink-soft`     | `#2d3a52` | Secondary text                                     |
| `--brass`        | `#c8a047` | Primary gold accent — buttons, links, scene gold   |
| `--brass-deep`   | `#9a7830` | Hover / pressed                                    |
| `--sky-top`      | `#050816` | Legacy dark-sky top (kept for SceneSky)            |
| `--sky-bottom`   | `#0d1530` | Legacy dark-sky bottom (kept for SceneSky)         |
| `--ink-dark`     | `#f6f0e4` | Text on dark scenes (same as paper for cohesion)   |
| `--cream`        | `#f7ecd6` | Warm cream for cinematic interiors (beats 1, 3)    |
| `--cream-deep`   | `#e8d6ad` | Deeper cream for shadows / undersides              |
| `--marble-white` | `#fbf7ef` | Penthouse exteriors, glass tint                    |
| `--gold-glow`    | `#d9b063` | Cinematic gold accent (warmer than `--brass`)      |
| `--gold-deep`    | `#a37b2d` | Inset gold, deep shadow                            |
| `--sky-warm-top` | `#f5d99a` | Golden-hour sky top (beats 0, 2, 3)                |
| `--sky-warm-mid` | `#e8b070` | Golden-hour mid-band                               |
| `--sky-warm-haze`| `#fde7c4` | Cloud / haze tint                                  |

**The cinematic is warm: golden-hour sky, white-and-gold penthouses.**
The original "Private Bank" dark palette is preserved as legacy tokens
on `SceneSky` only until that scene is reworked. The rest of the site
(About, Purchase, etc.) stays in the existing `--paper` / `--ink` /
`--brass` palette.

## Cinematic journey (4 beats)

The hero pin in `lib/scroll.ts` runs for `+=400%`, giving four beats of
100vh scroll each. `lib/pageBounds.ts → getBeat()` maps scrollY to:

| Beat | Scene component         | What happens                                            |
|------|-------------------------|---------------------------------------------------------|
| 0    | `SceneSky`              | High in golden-hour sky; first white penthouse appears  |
| 1    | `ScenePenthouseInterior`| Glide through gold-trimmed interior                     |
| 2    | `SceneTransitSky`       | Exit, soar upward through warm clouds                   |
| 3    | `ScenePenthouseFinale`  | Descend to face second penthouse on cliff               |

Each scene is wrapped in `<BeatGate index={N}>` in `CanvasRoot`. The
gate toggles `group.visible` via ref — no React re-render per frame.

Reference video for the journey: see `docs/cinematic-reference.md`.

`BeatHud` (bottom-right corner) shows the active beat + local progress
during development. Delete it once the real scenes are in.

## Performance budget

- 60fps on a 2021 iPhone (A14)
- Limit total triangles in any active scene to ~50k
- `dpr={[1, 1.75]}` on the Canvas (don't render at 3x on retina)
- Pause scenes when their scroll range is fully off-screen
- `<Bloom>` is the most expensive postprocess — keep `intensity` modest

## Don'ts

- No new `<Canvas>` instances
- No `useState` driven by `useFrame` (causes per-frame React render)
- No `setInterval` / `setTimeout` for scene animation
- No "Welcome!" / "Hello!" / exclamation copy
- No emojis
- No first-person flight / airplane / helicopter clichés
- No orbit controls unless the prompt explicitly asks for them
- No corporate stock photography

## Existing assets (preserve)

- `public/assets/chris-gramly.png` — Chris's headshot
- `public/assets/clear-modern-logo.png` — company logo
- `public/assets/home-financing-hero.png` — original hero photograph
- `public/assets/equal-housing.svg` — equal housing opportunity badge
- Phone: (702) 767-4072 · Email: chris.gramly@clearmtg.com
- NMLS: 1984074 · Licensed CA + NV
- Office: 8751 W Charleston Blvd #220, Las Vegas, NV 89117
- FormSubmit endpoint: `https://formsubmit.co/ajax/chris.gramly@clearmtg.com`
- Apply Now: `https://www.clearmodernmortgage.com/loan-officer/chris-gramly/apply-now`

## Building & deploying

```bash
npm install
npm run dev      # Vite dev server at 127.0.0.1:5173
npm run build    # Output to dist/
npm run preview  # Serve the build
```

GitHub Pages source must be set to **"GitHub Actions"** in repo settings.
The workflow `.github/workflows/pages.yml` builds `/dist` and deploys.
