# Circulation Lab

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

Explore work, flux, circulation, and the integral theorems of vector calculus.

## Features

- **Same Destination, Different Work.** Compare signed work along two paths and reverse either path.
- **Flux Through a Gate.** Move and rotate a segment and flip its normal to compare signed flux.
- **Divergence vs. Curl.** Compare the sides and totals of a square probe in three fields.
- **Green’s Theorem by Cancellation.** Cancel shared edges in a tiled region and inspect the boundary.
- **One Rim, Two Surfaces.** Compare circulation along a fixed rim with curl flux through a disk and a cap.
- Keyboard controls and live screen-reader summaries
- Default and projector color profiles

## Quick Start

```bash
npm install
npm run icons    # generate PNG icons from public/icons/icon.svg
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run test:soak` | By-hand leak soaks: headless (`tests/soak/headless.soak.ts`), then browser (`tests/soak/browser.spec.ts`) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome check (warnings fail too) |
| `npm run check:unused` / `npm run knip` | Report unused files, exports, and dependencies (manual check) |
| `npm run check:architecture` | dependency-cruiser layer and cycle rules on `src/` (manual check) |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |


## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.5 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^2 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
