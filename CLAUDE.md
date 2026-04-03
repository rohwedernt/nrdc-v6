# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website (v6) for Nate Rohweder, built with SvelteKit and deployed on Vercel. Features a minimalist design with a full-screen background, interactive Pong game, an AI-powered theme generator, and a hidden "extras" page accessible via keyboard shortcut.

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

## Architecture

**Stack:** SvelteKit 2 + Svelte 5, TypeScript, TailwindCSS 4, Vercel adapter

**Routing:** File-based SvelteKit routing under `src/routes/`. Most pages use `export const prerender = true` and disable CSR in production (`export const csr = dev`). The `/theme` route is an exception — it sets `export const ssr = false` and is not prerendered.

**Global layout (`src/routes/+layout.svelte`)** wraps all pages with four persistent components:
- `BackgroundImage` — full-screen hero image (z-index: -1)
- `KeyBindings` — global keyboard listener (`Alt+Shift+/` → `/extras`, `Escape` → home)
- `Navigation` — top-right nav with About/Contact links; clicking the active route navigates home
- `SlidePanel` — bottom slide-up panel showing tech stack/version info

The layout's `+layout.ts` passes `data.url.pathname` to all pages, used by Navigation and KeyBindings for active state.

**Page pattern:** Most content pages (About, Contact, Extras, Pong) render as a fixed, centered glass-panel modal (`position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)`) over the background. They include a close button (X icon) that navigates to `/`.

**i18n:** `svelte-i18n` with English (`src/locales/en.json`) and Spanish (`src/locales/es.json`). Initialized in `src/lib/i18n.js`; browser locale auto-detected with English fallback.

**Routes:**
- `/` — landing page; on mount, redirects to `/theme` unless the user has already skipped it (checked via `themeStore`)
- `/theme` — AI theme generator; prompts user to describe a vibe, calls `/api/generate`, renders result in a full-screen iframe; "skip" sets `themeStore` status to `'skipped'` and navigates to `/`
- `/about` — biography
- `/contact` — grid of links (email, LinkedIn, GitHub, resume)
- `/extras` — hidden page (music links + Pong entry); reachable via `Alt+Shift+/`
- `/pong` — canvas-based Pong game
- `/home` — 307 redirect to `/`

**AI theme generation** (`src/routes/api/generate/+server.ts`): POST endpoint that accepts `{ theme, locale }`, calls the Anthropic API (`claude-sonnet-4-6`) to generate a `<style>` block, injects it into an HTML scaffold built from i18n strings, and returns `{ html }`. Requires `ANTHROPIC_API_KEY` env var. The scaffold mirrors the site's About/Contact content so the themed preview looks like a real portfolio page.

**Theme store** (`src/lib/stores/theme.ts`): Svelte writable store tracking theme generation state (`initial | skipped | generating | generated | error`). Used by `/` to gate the redirect and by `ThemePrompt.svelte` to drive UI state. Note: `ThemePrompt.svelte` (`src/lib/components/`) is a component-based variant of the theme UI — the canonical page implementation lives at `src/routes/theme/+page.svelte`.

**Server hook** (`src/hooks.server.ts`): returns 204 for `/.well-known/*` requests (browser extension metadata).

## Code Style

Prettier config: tabs, 100-char line width, single quotes. Run `pnpm run format` before committing.
