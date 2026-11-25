/**
 * CirculationLabConstants.ts
 *
 * Central repository for every named numeric constant used across the
 * simulation. Bare numbers that carry semantic meaning (sizes, margins,
 * physics defaults, ranges) belong here rather than inline in model or view
 * code, so they are named, documented, and changed in one place.
 *
 * Conventions
 * ───────────
 *  - Model / math values note their unit in a comment on each value.
 *  - Layout / chrome values are in screen pixels.
 *  - Colour strings live in CirculationLabColors.ts, not here.
 *  - Computed expressions (e.g. `2 * Math.PI`) may stay inline.
 *
 * PLOT_* matches Contour Explorer and Double Integral Builder LabView copies
 * — keep those in sync.
 */

import CirculationLabNamespace from "./CirculationLabNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/**
 * Corner radius shared by control panels and dialogs.
 * @public
 */
export const PANEL_CORNER_RADIUS = 6;

/** Lab plot canvas width (px). */
export const PLOT_WIDTH = 590;

/** Lab plot canvas height (px). */
export const PLOT_HEIGHT = 420;

/** Inner margin from plot edge to axis content (px). */
export const PLOT_MARGIN = 23;

/** Control panel minimum width (px). */
export const PANEL_MIN_WIDTH = 325;

/** Gap between plot and control panel (px). */
export const PANEL_GAP = 18;

/** Gap between title and plot/panel row (px). */
export const TITLE_TO_PLOT_GAP = 14;

// ── Model / field viz ─────────────────────────────────────────────────────────

/** Half-extent of the field-arrow sampling grid (model units). */
export const FIELD_LIMIT = 2.5;

/** Spacing of the field-arrow sampling grid (model units). */
export const FIELD_STEP = 0.5;

/** Longest drawn field arrow, in model units, for the strongest vector in view. */
export const LONGEST_ARROW = 0.42;

/** Default flux-gate length (model units). */
export const DEFAULT_GATE_LENGTH = 1.4;

/** Flux-gate length slider range (model units). */
export const GATE_LENGTH_MIN = 0.4;
export const GATE_LENGTH_MAX = 2.4;

/** Default Simpson panels for path integrals. */
export const SIMPSON_PANELS = 64;

CirculationLabNamespace.register("CirculationLabConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  PLOT_WIDTH,
  PLOT_HEIGHT,
  PLOT_MARGIN,
  PANEL_MIN_WIDTH,
  PANEL_GAP,
  TITLE_TO_PLOT_GAP,
  FIELD_LIMIT,
  FIELD_STEP,
  LONGEST_ARROW,
  DEFAULT_GATE_LENGTH,
  GATE_LENGTH_MIN,
  GATE_LENGTH_MAX,
  SIMPSON_PANELS,
});
