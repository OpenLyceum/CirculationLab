import { Range } from "scenerystack/dot";
import { Node } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import { canvasText, drawField, fieldChoices, strongest } from "../../common/FieldPlot.js";
import {
  addPointDrag,
  arrow,
  checkbox,
  comboBox,
  computed,
  dot,
  format,
  LabView,
  line,
  Plane,
  PlotCanvas,
  plotLabel,
  slider,
} from "../../common/LabView.js";
import { fieldLabel, fields, fieldVector, gateFlux, gateGeometry, type Point } from "../../common/model/VectorMath.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { FluxThroughAGateModel } from "../model/FluxThroughAGateModel.js";

// Samples along the gate where F · n is drawn as a normal arrow.
const GATE_SAMPLES = 9;

export class FluxThroughAGateScreenView extends LabView {
  public constructor(model: FluxThroughAGateModel, options?: ScreenViewOptions) {
    const manager = StringManager.getInstance();
    const { controls: s, headingStringProperty, screenSummary } = manager.getFluxThroughAGateA11yStrings();
    const { fieldProperty, lengthProperty, xProperty, yProperty, angleProperty, flippedProperty, properties } = model;
    const center = (): Point => [xProperty.value, yProperty.value];
    const gate = () => gateGeometry(center(), angleProperty.value, flippedProperty.value, lengthProperty.value);
    const formula = computed([fieldProperty], () => `F = ${fieldLabel(fieldProperty.value)}`);
    const normal = computed(properties, () => {
      const [a, b] = gate().normal;
      return `n = (${format(a)}, ${format(b)})`;
    });
    const flux = computed(
      properties,
      () =>
        `∫ F · n ds = ${format(gateFlux(fieldProperty.value, center(), angleProperty.value, flippedProperty.value, lengthProperty.value), 4)}`,
    );
    const details = computed(
      [formula, normal, flux, xProperty, yProperty, angleProperty, lengthProperty],
      () =>
        `${canvasText(formula.value)}. ${s.lengthStringProperty.value} ${format(lengthProperty.value)}. (x, y) = (${format(xProperty.value)}, ${format(yProperty.value)}). θ = ${format(angleProperty.value)}°. ${normal.value}. ${flux.value}.`,
    );
    const plane = new Plane(new Range(-2.5, 2.5), new Range(-2.5, 2.5));
    const plot = new PlotCanvas(properties, (context, colors) => {
      plane.axes(context, colors);
      drawField(context, plane, fieldProperty.value, colors);
      const {
        ends,
        normal: [nx, ny],
      } = gate();
      const [x, y] = center();
      const start = plane.project([x, y]);
      const tip = plane.project([x + 0.65 * nx, y + 0.65 * ny]);
      line(context, ends.map(plane.project), colors.accent, 5);
      // F · n along the gate: each arrow points along ±n, as long as the normal part of F there.
      const scale = 0.42 / strongest(fieldProperty.value);
      const [[ax, ay], [bx, by]] = ends;
      for (let i = 0; i < GATE_SAMPLES; i++) {
        const t = (i + 0.5) / GATE_SAMPLES;
        const at: Point = [ax + (bx - ax) * t, ay + (by - ay) * t];
        const [p, q] = fieldVector(fieldProperty.value, at);
        const across = (p * nx + q * ny) * scale;
        arrow(
          context,
          plane.project(at),
          plane.project([at[0] + across * nx, at[1] + across * ny]),
          across >= 0 ? colors.alternate : colors.ink,
          2,
        );
      }
      dot(context, plane.project(ends[0]), colors.accent);
      dot(context, plane.project(ends[1]), colors.accent);
      arrow(context, start, tip, colors.alternate, 3);
      plotLabel(context, "n", [tip[0] + 6, tip[1] - 5], colors.alternate);
      plotLabel(context, canvasText(formula.value), [16, 25], colors.ink);
    });
    addPointDrag(plot, plane, xProperty, yProperty, s.dragTargetStringProperty);
    const listParent = new Node();
    super(
      {
        title: headingStringProperty,
        summary: screenSummary,
        details,
        plot,
        listParent,
        controls: [
          comboBox(fieldProperty, fieldChoices(fields), listParent, s.fieldStringProperty),
          slider(s.lengthStringProperty, lengthProperty, 0.1),
          slider(s.xStringProperty, xProperty, 0.05),
          slider(s.yStringProperty, yProperty, 0.05),
          slider(s.angleStringProperty, angleProperty, 5, "°"),
          checkbox(s.flippedStringProperty, flippedProperty),
        ],
        readouts: [formula, normal, flux],
        reset: () => model.reset(),
      },
      options,
    );
  }
}
