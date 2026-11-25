import { FIELD_LIMIT, FIELD_STEP, LONGEST_ARROW } from "../CirculationLabConstants.js";
import { arrow, type Plane, type PlotColors } from "./LabView.js";
import { type Edge, type Field, fieldLabel, fieldVector, type Point } from "./model/VectorMath.js";

/** The largest |F| on the arrow grid, so arrow lengths can be proportional to magnitude. */
export function strongest(field: Field): number {
  let top = 0;
  for (let x = -FIELD_LIMIT; x <= FIELD_LIMIT; x += FIELD_STEP) {
    for (let y = -FIELD_LIMIT; y <= FIELD_LIMIT; y += FIELD_STEP) {
      top = Math.max(top, Math.hypot(...fieldVector(field, [x, y])));
    }
  }
  return Math.max(top, 1e-9);
}

/** Field arrows on a grid, each as long as its vector relative to the strongest in view. */
export function drawField(context: CanvasRenderingContext2D, plane: Plane, field: Field, colors: PlotColors): void {
  const scale = LONGEST_ARROW / strongest(field);
  context.save();
  context.globalAlpha = 0.4;
  for (let x = -FIELD_LIMIT; x <= FIELD_LIMIT; x += FIELD_STEP) {
    for (let y = -FIELD_LIMIT; y <= FIELD_LIMIT; y += FIELD_STEP) {
      const [a, b] = fieldVector(field, [x, y]);
      arrow(context, plane.project([x, y]), plane.project([x + scale * a, y + scale * b]), colors.ink, 1);
    }
  }
  context.restore();
}

/** Combo-box entries for a list of fields: "F = (x, y)", spoken without markup. */
export function fieldChoices(list: readonly Field[]) {
  return list.map((field) => ({
    value: field,
    label: `F = ${fieldLabel(field)}`,
    name: `F = ${fieldLabel(field)
      .replace(/<sup>([^<]*)<\/sup>/g, "^$1")
      .replace(/<[^>]+>/g, "")}`,
  }));
}

/** Plain text for the canvas: <sup>2</sup> becomes ², other tags are dropped. */
export function canvasText(markup: string): string {
  const superscripts: Record<string, string> = { "2": "²", "3": "³" };
  return markup
    .replace(/<sup>([^<]*)<\/sup>/g, (_, power: string) => superscripts[power] ?? `^${power}`)
    .replace(/<[^>]+>/g, "");
}

export function midpoint([[x, y], [a, b]]: Edge): Point {
  return [(x + a) / 2, (y + b) / 2];
}
