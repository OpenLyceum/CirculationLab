# Implementation notes — Circulation Lab

The screen packages are work, gate, probe, green, stokes. Each model owns its reactive controls and resets them through the standard Reset All button. The pure calculations live in `src/common/model/VectorMath.ts` and are exercised by model tests.

The planar screens paint field arrows, paths, and tiled regions in Scenery. The Stokes view projects the surfaces and normals into the same canvas system. Green pairs edges by integer grid coordinates before converting them to plot coordinates.

The shared Scenery view arranges the plot and controls, registers the live accessible screen summary, and reads the active color profile. Screen-specific text comes from `StringManager`.
