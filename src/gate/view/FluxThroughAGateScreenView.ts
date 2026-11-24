import { Range } from "scenerystack/dot";
import type { ScreenViewOptions } from "scenerystack/sim";
import { drawField } from "../../common/FieldPlot.js";
import {
  addPointDrag,
  arrow,
  checkbox,
  choice,
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
import { gateFlux, gateGeometry, type Point } from "../../common/model/VectorMath.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { FluxThroughAGateModel } from "../model/FluxThroughAGateModel.js";

export class FluxThroughAGateScreenView extends LabView {
  public constructor(model: FluxThroughAGateModel, options?: ScreenViewOptions) {
    const manager = StringManager.getInstance();
    const { controls: s, headingStringProperty, screenSummary } = manager.getFluxThroughAGateA11yStrings();
    const { fieldProperty, xProperty, yProperty, angleProperty, flippedProperty, properties } = model;
    const center = (): Point => [xProperty.value, yProperty.value];
    const gate = () => gateGeometry(center(), angleProperty.value, flippedProperty.value);
    const fieldName = computed(
      [fieldProperty, s.uniformStringProperty, s.sourceStringProperty],
      () => (fieldProperty.value === "uniform" ? s.uniformStringProperty : s.sourceStringProperty).value,
    );
    const formula = computed([fieldProperty], () => (fieldProperty.value === "uniform" ? "F = (1, 0)" : "F = (x, y)"));
    const normal = computed(properties, () => {
      const [a, b] = gate().normal;
      return `n = (${format(a)}, ${format(b)})`;
    });
    const flux = computed(
      properties,
      () =>
        `∫ F · n ds = ${format(gateFlux(fieldProperty.value, center(), angleProperty.value, flippedProperty.value), 4)}`,
    );
    const details = computed(
      [fieldName, formula, normal, flux, xProperty, yProperty, angleProperty],
      () =>
        `${fieldName.value}. ${formula.value}. (x, y) = (${format(xProperty.value)}, ${format(yProperty.value)}). θ = ${format(angleProperty.value)}°. ${normal.value}. ${flux.value}.`,
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
      dot(context, plane.project(ends[0]), colors.accent);
      dot(context, plane.project(ends[1]), colors.accent);
      arrow(context, start, tip, colors.alternate, 3);
      plotLabel(context, "n", [tip[0] + 6, tip[1] - 5], colors.alternate);
      plotLabel(context, formula.value, [16, 25], colors.ink);
    });
    addPointDrag(plot, plane, xProperty, yProperty, s.dragTargetStringProperty);
    super(
      {
        title: headingStringProperty,
        summary: screenSummary,
        details,
        plot,
        controls: [
          choice(s.fieldStringProperty, fieldName, () => {
            fieldProperty.value = fieldProperty.value === "uniform" ? "source" : "uniform";
          }),
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
