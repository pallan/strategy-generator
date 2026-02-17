# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A curling strategy practice tool that generates randomized in-game scenarios on an HTML5 Canvas. Players/teams use it to discuss strategy for different game situations. The app also includes an age eligibility calculator and an MJCT points breakdown calculator.

## Architecture

This is a static site with no build step, no bundler, and no package manager. Serve files directly with a static server (e.g., VS Code Live Server on port 5500).

### Pages

- **index.html** — Main strategy generator. Renders a curling house on `<canvas>` with randomly placed stones and a randomized game scenario (end, score, hammer, position). Uses `js/app.js` as an ES module import.
- **eligibility.html** — Age-based eligibility checker for curling events. Self-contained inline JS with jQuery.
- **points.html** — MJCT points distribution calculator. Self-contained inline JS with jQuery. Points lookup table is defined both in a `<pre>` block and in a `<script>` block.

### Key Concepts in js/app.js

- `HouseScenario(scale, canvasId)` — Constructor that sets up the canvas and draws the curling house. All rendering uses prototype methods.
- **Zones 1-4** — The playing area is divided into four zones (hogline to backline) with configurable weighted probabilities for stone placement.
- **Scenario generation** — Randomly determines end number, hammer, throwing position, score differential, and stone positions. Each stone has a 55% chance of remaining in play.
- **localStorage** — Scenarios can be saved/loaded from browser localStorage.
- **Firebase** — Initialized but not actively used for any features.

## Development

No build or test commands. Open HTML files directly in a browser or use Live Server.

## Tech Stack

- Vanilla JS (ES modules in app.js, inline scripts elsewhere)
- Bootstrap 4.3.1 (CDN)
- HTML5 Canvas for house rendering
- jQuery (only in eligibility.html and points.html)
- Firebase JS SDK imported but unused
