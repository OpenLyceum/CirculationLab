import { Range } from "scenerystack/dot";
import type { ScreenViewOptions } from "scenerystack/sim";
import { drawField } from "../../common/FieldPlot.js";
import {
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
import { pathPoint, pathWork } from "../../common/model/VectorMath.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { SameDestinationDifferentWorkModel } from "../model/SameDestinationDifferentWorkModel.js";

const PATH_SAMPLES = 60;

export class SameDestinationDifferentWorkScreenView extends LabView {
  public constructor(model: SameDestinationDifferentWorkModel, options?: ScreenViewOptions) {
    const manager = StringManager.getInstance();
    const { controls: s, headingStringProperty, screenSummary } = manager.getSameDestinationDifferentWorkA11yStrings();
    const { fieldProperty, progressProperty, reverseSegmentProperty, reverseArcProperty, properties } = model;
    const fieldName = computed(
      [fieldProperty, s.gradientStringProperty, s.rotationStringProperty],
      () => (fieldProperty.value === "gradient" ? s.gradientStringProperty : s.rotationStringProperty).value,
    );
    const fieldFormula = computed([fieldProperty], () =>
      fieldProperty.value === "gradient" ? "F = (1 + x, y)" : "F = (−y/2, x/2)",
    );
    const work = computed(properties, () => {
      const segment = pathWork(fieldProperty.value, "segment", progressProperty.value, reverseSegmentProperty.value);
      const arc = pathWork(fieldProperty.value, "semicircle", progressProperty.value, reverseArcProperty.value);
      return `W₁ = ${format(segment, 4)}      W₂ = ${format(arc, 4)}`;
    });
    const details = computed(
      [fieldName, fieldFormula, work, progressProperty],
      () => `${fieldName.value}. ${fieldFormula.value}. t = ${format(progressProperty.value)}. ${work.value}.`,
    );
    const plane = new Plane(new Range(-1.6, 1.6), new Range(-0.9, 1.55));
    const plot = new PlotCanvas(properties, (context, colors) => {
      plane.axes(context, colors);
      drawField(context, plane, fieldProperty.value, colors);
      for (const [kind, color, reverse, number] of [
        ["segment", colors.accent, reverseSegmentProperty.value, "1"],
        ["semicircle", colors.alternate, reverseArcProperty.value, "2"],
      ] as const) {
        const p = (t: number) => plane.project(pathPoint(kind, reverse ? 1 - t : t));
        const curve = (end: number) => Array.from({ length: PATH_SAMPLES + 1 }, (_, i) => p((end * i) / PATH_SAMPLES));
        context.save();
        context.globalAlpha = 0.65;
        context.setLineDash([4, 4]);
        line(context, curve(1), color, 1.5);
        context.restore();
        line(context, curve(progressProperty.value), color, 4);
        arrow(context, p(0.42), p(0.51), color);
        const marker = p(progressProperty.value);
        dot(context, marker, color, 5);
        const tag = p(0.67);
        plotLabel(context, number, [tag[0] + 5, tag[1] - 7], color);
      }
      plotLabel(context, fieldFormula.value, [16, 25], colors.ink);
    });
    super(
      {
        title: headingStringProperty,
        summary: screenSummary,
        details,
        plot,
        controls: [
          choice(s.fieldStringProperty, fieldName, () => {
            fieldProperty.value = fieldProperty.value === "gradient" ? "halfRotation" : "gradient";
          }),
          slider(s.progressStringProperty, progressProperty, 0.02),
          checkbox(s.reverseSegmentStringProperty, reverseSegmentProperty),
          checkbox(s.reverseArcStringProperty, reverseArcProperty),
        ],
        readouts: [fieldFormula, work],
        reset: () => model.reset(),
      },
      options,
    );
  }
}
