# AGENTS.md — Circulation Lab

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Circulation Lab (`circulation-lab`) is a SceneryStack simulation scaffolded from SceneryStackTemplate.

## Key files

| File | Purpose |
|---|---|
| `src/CirculationLabColors.ts` | All `ProfileColorProperty` instances |
| `src/CirculationLabConstants.ts` | Named numeric constants |
| `src/CirculationLabNamespace.ts` | Namespace for color property names |
| `src/i18n/StringManager.ts` | Singleton localized string accessor |
| `src/common/CirculationLabPanel.ts` | Pre-themed `Panel` wrapper |
| `src/common/CirculationLabButtonOptions.ts` | Flat button / combo-box option bundles |
| `src/work/SameDestinationDifferentWorkScreen.ts` | Screen wrapper |
| `src/work/model/SameDestinationDifferentWorkModel.ts` | Simulation state and logic |
| `src/work/view/SameDestinationDifferentWorkScreenView.ts` | Visual nodes, layout, a11y wiring |
| `src/gate/FluxThroughAGateScreen.ts` | Screen wrapper |
| `src/gate/model/FluxThroughAGateModel.ts` | Simulation state and logic |
| `src/gate/view/FluxThroughAGateScreenView.ts` | Visual nodes, layout, a11y wiring |
| `src/probe/DivergenceVsCurlScreen.ts` | Screen wrapper |
| `src/probe/model/DivergenceVsCurlModel.ts` | Simulation state and logic |
| `src/probe/view/DivergenceVsCurlScreenView.ts` | Visual nodes, layout, a11y wiring |
| `src/green/GreensTheoremByCancellationScreen.ts` | Screen wrapper |
| `src/green/model/GreensTheoremByCancellationModel.ts` | Simulation state and logic |
| `src/green/view/GreensTheoremByCancellationScreenView.ts` | Visual nodes, layout, a11y wiring |
| `src/stokes/OneRimTwoSurfacesScreen.ts` | Screen wrapper |
| `src/stokes/model/OneRimTwoSurfacesModel.ts` | Simulation state and logic |
| `src/stokes/view/OneRimTwoSurfacesScreenView.ts` | Visual nodes, layout, a11y wiring |

## Compliance carve-outs

None yet.

## Testing

See the shared Vitest setup (`vitest.config.ts`, `tests/setup.ts`) and `tests/memory-leak.test.ts` for disposal coverage. Add sim-specific unit tests under `tests/` as physics and UI logic land.

## Accessibility

Follow [Baton/ACCESSIBILITY.md](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md): PDOM names, per-screen `*ScreenSummaryContent`, and keyboard-help content. Document any intentional deviations under Compliance carve-outs.
