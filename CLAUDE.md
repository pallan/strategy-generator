# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A curling strategy practice tool that generates randomized in-game scenarios using SVG rendering. Players/teams use it to discuss strategy for different game situations. The app also includes an age eligibility calculator.

## Architecture

This is a static site with no build step, no bundler, and no package manager. Serve files directly with a static server (e.g., VS Code Live Server on port 5501).

### Pages

- **index.html** — Main strategy generator. Renders a curling house as an inline SVG with randomly placed stones and a randomized game scenario (end, score, hammer, position). Uses `js/app.js`.
- **eligibility.html** — Age-based eligibility checker for curling events. Uses `js/eligibility.js`.

### Key Concepts in js/app.js

- `HouseScenario` — ES6 class that manages SVG stone rendering and scenario generation. The static house (rings, lines) is defined as SVG markup in index.html; only stones are dynamically created.
- **Zones 1-4** — The playing area is divided into four zones (hogline to backline) with configurable weighted probabilities for stone placement.
- **Scenario generation** — Randomly determines end number, hammer, throwing position, score differential, and stone positions. Each stone has a 55% chance of remaining in play.
- **localStorage** — Scenarios can be saved/loaded from browser localStorage. All JSON.parse calls are wrapped in try-catch via `safeParseJSON()`.

## Development

No build or test commands. Open HTML files directly in a browser or use Live Server.

## Tech Stack

- Vanilla JS (ES6 classes and modules)
- TailwindCSS v4 (CDN Play script — no build step)
- TailwindPlus Elements (CDN — interactive navbar components)
- SVG for house rendering
