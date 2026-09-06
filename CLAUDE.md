# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive Treasure Box Game — a single-page React app where users click on treasure chests to find hidden treasure. One of three chests contains treasure (+$100), the others contain skeletons (-$50). The game ends when treasure is found or all chests are opened.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start Vite dev server on port 3000 (auto-opens browser)
- `npm run build` — production build to `build/` directory

There are no test or lint scripts configured.

## Architecture

**Single-component app**: All game logic lives in `src/App.tsx` — state management (boxes, score, game-over), box initialization with random treasure placement, click handlers, and the full UI. There is no routing or multi-page structure.

**Stack**: React 18, Vite with SWC plugin, Tailwind CSS v4, Framer Motion (`motion/react`), shadcn/ui components (Radix UI primitives + `class-variance-authority` + `tailwind-merge`).

**Path alias**: `@` maps to `./src` (configured in `vite.config.ts`). Use `@/components/ui/button` style imports.

**UI components**: `src/components/ui/` contains shadcn/ui components. `cn()` utility from `src/components/ui/utils.ts` merges Tailwind classes.

**Styling**: Tailwind v4 with CSS-based config in `src/styles/globals.css` (design tokens as CSS custom properties). Pre-compiled Tailwind output is in `src/index.css`. The base font size is 14px.

**Assets**: Treasure chest images in `src/assets/`, sound effects in `src/audios/` (chest_open.mp3, chest_open_with_evil_laugh.mp3 — not yet wired up in the initial codebase).
