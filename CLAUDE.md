# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website (v6) for Nate Rohweder, built with SvelteKit and deployed on Vercel. Features a minimalist design with a full-screen background, an AI-powered theme generator, an interactive Pong game, and a hidden "extras" page.

## Commands

```bash
pnpm run dev          # Start Vite dev server
pnpm run build        # Build for production
pnpm run preview      # Preview production build
pnpm run check        # Run svelte-check type checking
pnpm run check:watch  # Watch mode type checking
pnpm run lint         # Prettier check + ESLint
pnpm run format       # Format with Prettier
```

No test suite is configured.

## Environment Variables

```
ANTHROPIC_API_KEY=    # Required — powers the theme generator
UNSPLASH_ACCESS_KEY=  # Optional — adds real photos to generated themes; degrades gracefully without it
```

## Architecture

**Stack:** SvelteKit 2 + Svelte 5, TypeScript, TailwindCSS 4, Vercel adapter

**Global layout (`src/routes/+layout.svelte`)** wraps all pages with five persistent components:
- `BackgroundImage` — full-screen hero image (z-index: -1)
- `KeyBindings` — global keyboard listener (see Keyboard shortcuts below)
- `Navigation` — top-right nav (About/Contact); clicking the active route navigates home
- `SlidePanel` — bottom center slide-up tab showing tech stack info
- `LanguageToggle` — bottom-right EN/ES switcher

The layout's `+layout.ts` passes `url` to all pages. `Navigation` reads `page.url.pathname` from `$app/state` (Svelte 5 runes API) for active-state highlighting.

**Page rendering pattern:** Most content pages (`/about`, `/contact`, `/extras`) use `export const prerender = true` and `export const csr = dev` in their `+page.ts`. The root `/` sets `export const ssr = false` and is not prerendered. Pages render as fixed, centered glass-panel modals over the background image.

**Routes:**
- `/` — the AI theme generator (orb button → prompt card → loading → full-screen iframe result); `ExtrasModal` overlays on top of a generated theme when `extrasStore.open` is true
- `/about` — biography (glass-panel modal, prerendered)
- `/contact` — grid of links: email, LinkedIn, GitHub, resume (glass-panel modal, prerendered)
- `/extras` — hidden page with music links and Pong entry (glass-panel modal, prerendered); reachable via `Alt+Shift+/`
- `/pong` — canvas-based Pong game; Escape exits back to `/extras`
- `/home` — 307 redirect to `/`

**Keyboard shortcuts** (handled in `KeyBindings.svelte`):
- `Alt+Shift+/` (or `⌥+⬆+/`, also `¿` for international layouts) → navigates to `/extras`
- `Escape` → closes Pong if open in extras modal → closes extras modal → navigates to `/extras` from `/pong` → otherwise navigates to `/`

## State Management

**`extrasStore`** (`src/lib/stores/extras.ts`) is the only Svelte store. It tracks whether the `ExtrasModal` overlay is open and whether Pong is active within it. This modal is only relevant on the homepage when a theme has been generated — it renders `ExtrasModal.svelte` on top of the iframe.

Note: The `/extras` route and `ExtrasModal.svelte` are functionally parallel — the route is a standalone page, the modal overlays the homepage theme iframe.

## AI Theme Generation (`src/routes/api/generate/+server.ts`)

POST endpoint accepting `{ theme, locale }`. The pipeline:

1. **(Optional) Translate to English** — if `locale === 'es'`, calls `claude-haiku-4-5` to translate the vibe prompt so image queries and design direction stay accurate
2. **Extract image queries** — fast `claude-haiku-4-5` call returns `primaryQuery` + up to 2 `imageQueries` for Unsplash
3. **Fetch Unsplash photos** — parallel fetch; capped at 3 requests total (1 primary + 2 extras); skipped entirely if `UNSPLASH_ACCESS_KEY` is absent
4. **Stream full HTML** — `claude-sonnet-4-6` with `max_tokens: 4500` streams a complete HTML document; images are injected into the prompt; the response is streamed directly to the client to avoid Vercel's 504 gateway timeout

The Vercel function timeout is set to 60 seconds (`export const config = { maxDuration: 60 }`).

The client (`src/routes/+page.svelte`) reads the stream chunk-by-chunk, strips any markdown fences, and validates that the response ends with `</html>` before injecting into an iframe.

## i18n

`svelte-i18n` with English (`src/locales/en.json`) and Spanish (`src/locales/es.json`). Initialized in `src/lib/i18n.js`; browser locale auto-detected with English fallback. The layout `+layout.ts` imports `$lib/i18n` to ensure initialization before any page renders.

There is also a `messages/` directory at the project root used by the inlang/Paraglide toolchain for translation management — this is separate from the `src/locales/` files consumed at runtime by svelte-i18n.

## Code Style

Prettier config: tabs, 100-char line width, single quotes. Run `pnpm run format` before committing.
