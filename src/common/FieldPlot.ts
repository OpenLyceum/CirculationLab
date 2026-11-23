import { arrow, type Plane, type PlotColors } from "./LabView.js";
import { type Edge, type Field, fieldVector, type Point } from "./model/VectorMath.js";

const FIELD_LIMIT = 2.5;
const FIELD_STEP = 0.5;

export function drawField(context: CanvasRenderingContext2D, plane: Plane, field: Field, colors: PlotColors): void {
  context.save();
  context.globalAlpha = 0.37;
  for (let x = -FIELD_LIMIT; x <= FIELD_LIMIT; x += FIELD_STEP) {
    for (let y = -FIELD_LIMIT; y <= FIELD_LIMIT; y += FIELD_STEP) {
      const [a, b] = fieldVector(field, [x, y]);
      const length = Math.hypot(a, b);
      const scale = 0.14 / Math.max(0.7, length / 2);
      arrow(context, plane.project([x, y]), plane.project([x + scale * a, y + scale * b]), colors.ink, 1);
    }
  }
  context.restore();
}

export function midpoint([[x, y], [a, b]]: Edge): Point {
  return [(x + a) / 2, (y + b) / 2];
}
