# AGENTS.md — Circulation Lab

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Circulation Lab (`circulation-lab`) teaches line integrals, flux and circulation, and the theorems of Green and Stokes. Every plane screen chooses its field from a combo box. The fields are uniform, source, rotation, half rotation, shear and gradient (constant divergence and curl), plus (x², y), (xy, x − y), (sin y, cos x) and a swirl whose spin reverses at r = √2. In those last four, divergence or curl varies from place to place.

- **Work:** the straight path from A to B and a chosen second path (half circle to the left or right, or up-across-down). Drag A or B; the grips are pointer-only. Readouts give W₁(t) and W₂(t), the loop integral (out along 1, back along 2) and whether the field is curl-free.
- **Gate:** a movable gate with adjustable length. Arrows along it show F · n.
- **Div & Curl:** the square probe's net flux and circulation, each divided by area, beside the exact divergence and curl at the centre. Shrink the probe to watch the ratios converge. Edge arrows are scaled by each edge's contribution.
- **Green:** a tiled region in the field. Cell circulations are written on the cells, shared edges cancel stage by stage (Back/Next), and readouts compare the boundary circulation with the curl integral (Gauss–Legendre on each cell).
- **Stokes:** a paraboloid cap, dome or cone over the unit rim, with curl arrows on it. Turn it by dragging or with the slider. Its curl flux is computed and always equals the rim circulation, π.

## Key files

| File | Purpose |
|---|---|
| `src/common/model/VectorMath.ts` | Field library (F, divergence, curl, conservative flag), `lineIntegral` (Simpson per smooth piece), the paths, the gate, `probeTotals`, `tiledRegion`, `boundaryCirculation`, `curlIntegral`, cap shapes, `stokesTotals` |
| `src/common/FieldPlot.ts` | Field arrows scaled to the strongest vector in view, field combo-box entries, canvas text with superscripts |
| `src/common/LabView.ts` | Shared with Contour Explorer (kept identical apart from the prefix): layout, sliders, checkbox, `button`, `comboBox`, `PlotCanvas`, `Plane`, canvas helpers |
| `src/common/Projection.ts` | Orthographic projection, shared with Contour Explorer and Double Integral Builder |
| `tests/vector-math.test.ts` | Divergence and curl against F, path independence exactly for the curl-free fields, probe convergence, Green for nonlinear fields, Stokes for every cap |

## Compliance carve-outs

None yet.

## Testing

See the shared Vitest setup (`vitest.config.ts`, `tests/setup.ts`) and `tests/memory-leak.test.ts` for disposal coverage. Add sim-specific unit tests under `tests/` as physics and UI logic land.

## Accessibility

Follow [Baton/ACCESSIBILITY.md](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md): PDOM names, per-screen `*ScreenSummaryContent`, and keyboard-help content. Document any intentional deviations under Compliance carve-outs.
