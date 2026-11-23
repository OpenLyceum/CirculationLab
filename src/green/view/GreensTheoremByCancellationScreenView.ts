import { Range } from "scenerystack/dot";
import type { ScreenViewOptions } from "scenerystack/sim";
import { midpoint } from "../../common/FieldPlot.js";
import {
  arrow,
  checkbox,
  computed,
  format,
  LabView,
  line,
  Plane,
  PlotCanvas,
  plotLabel,
  slider,
} from "../../common/LabView.js";
import { boundaryCirculation, type Edge, type Point, tiledRegion } from "../../common/model/VectorMath.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { GreensTheoremByCancellationModel } from "../model/GreensTheoremByCancellationModel.js";

export class GreensTheoremByCancellationScreenView extends LabView {
  public constructor(model: GreensTheoremByCancellationModel, options?: ScreenViewOptions) {
    const manager = StringManager.getInstance();
    const { controls: s, headingStringProperty, screenSummary } = manager.getGreensTheoremByCancellationA11yStrings();
    const { divisionsProperty, flippedProperty, lShapeProperty, stageProperty, properties } = model;
    const region = () => tiledRegion(divisionsProperty.value, lShapeProperty.value);
    const stageLabels = [s.cellsStringProperty, s.pairsStringProperty, s.boundaryStringProperty];
    const stage = computed([stageProperty, ...stageLabels], () => stageLabels[stageProperty.value]?.value ?? "");
    const circulation = computed(
      properties,
      () => `∮ F · dr = ${format(boundaryCirculation(region().boundary, flippedProperty.value))}`,
    );
    const curlIntegral = computed(
      properties,
      () => `∬ (∇ × F) · n dA = ${format(region().area * (flippedProperty.value ? -1 : 1))}`,
    );
    const pairs = computed(properties, () => `${region().shared.length} × (w − w) = 0`);
    const details = computed(
      [stage, circulation, curlIntegral, pairs],
      () => `${stage.value}. ${circulation.value}. ${curlIntegral.value}. ${pairs.value}.`,
    );

    const plane = new Plane(new Range(-1.6, 1.6), new Range(-1.55, 1.55));
    const plot = new PlotCanvas(properties, (context, colors) => {
      const { cells, boundary, shared } = region();
      const currentStage = stageProperty.value;
      const flipped = flippedProperty.value;
      plane.axes(context, colors);
      for (const cell of cells) {
        context.globalAlpha = 0.13;
        line(
          context,
          cell.map((edge) => plane.project(edge[0])),
          colors.accent,
          1,
          colors.accent,
        );
        context.globalAlpha = 1;
      }
      function directed(edge: Edge, color: string, width: number, inset: number): void {
        const [a, b] = edge;
        const [x, y] = midpoint(edge);
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const start: Point = [x - dx * 0.31 - dy * inset, y - dy * 0.31 + dx * inset];
        const end: Point = [x + dx * 0.31 - dy * inset, y + dy * 0.31 + dx * inset];
        arrow(context, plane.project(flipped ? end : start), plane.project(flipped ? start : end), color, width);
      }
      if (currentStage === 0) {
        for (const cell of cells) {
          for (const edge of cell) {
            directed(edge, colors.accent, 1.5, 0.14);
          }
        }
      } else {
        for (const edge of boundary) {
          line(context, edge.map(plane.project), colors.accent, 2);
          directed(edge, colors.accent, 2.5, 0);
        }
      }
      if (currentStage === 1) {
        for (const edge of shared) {
          directed(edge, colors.alternate, 1.2, 0.17);
          directed([edge[1], edge[0]], colors.alternate, 1.2, 0.17);
          const [x, y] = plane.project(midpoint(edge));
          line(
            context,
            [
              [x - 3, y - 3],
              [x + 3, y + 3],
            ],
            colors.ink,
          );
          line(
            context,
            [
              [x - 3, y + 3],
              [x + 3, y - 3],
            ],
            colors.ink,
          );
        }
      }
      plotLabel(context, "F = (−y/2, x/2)", [16, 25], colors.ink);
      plotLabel(context, stage.value, [16, 396], colors.ink);
    });
    super(
      {
        title: headingStringProperty,
        summary: screenSummary,
        details,
        plot,
        controls: [
          checkbox(s.lShapeStringProperty, lShapeProperty),
          slider(s.divisionsStringProperty, divisionsProperty, 1),
          slider(s.stageStringProperty, stageProperty, 1),
          checkbox(s.flippedStringProperty, flippedProperty),
        ],
        readouts: [stage, pairs, circulation, curlIntegral],
        reset: () => model.reset(),
      },
      options,
    );
  }
}
