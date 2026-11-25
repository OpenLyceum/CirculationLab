import { Range } from "scenerystack/dot";
import { HBox, Node } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import { canvasText, drawField, fieldChoices, midpoint } from "../../common/FieldPlot.js";
import {
  arrow,
  button,
  checkbox,
  comboBox,
  computed,
  format,
  LabView,
  line,
  Plane,
  PlotCanvas,
  plotLabel,
  slider,
} from "../../common/LabView.js";
import {
  boundaryCirculation,
  curlIntegral,
  type Edge,
  fieldLabel,
  type Point,
  tiledRegion,
} from "../../common/model/VectorMath.js";
import { StringManager } from "../../i18n/StringManager.js";
import { type GreensTheoremByCancellationModel, greenFields } from "../model/GreensTheoremByCancellationModel.js";

// Cell circulations are written on the cells while they stay legible.
const MAX_LABELLED_CELLS = 16;

export class GreensTheoremByCancellationScreenView extends LabView {
  public constructor(model: GreensTheoremByCancellationModel, options?: ScreenViewOptions) {
    const manager = StringManager.getInstance();
    const { controls: s, headingStringProperty, screenSummary } = manager.getGreensTheoremByCancellationA11yStrings();
    const { fieldProperty, divisionsProperty, flippedProperty, lShapeProperty, stageProperty, properties } = model;
    const formula = computed([fieldProperty], () => `F = ${fieldLabel(fieldProperty.value)}`);
    const region = () => tiledRegion(divisionsProperty.value, lShapeProperty.value);
    const stageLabels = [s.cellsStringProperty, s.pairsStringProperty, s.boundaryStringProperty];
    const stage = computed([stageProperty, ...stageLabels], () => stageLabels[stageProperty.value]?.value ?? "");
    const circulation = computed(
      properties,
      () =>
        `∮ F · dr = ${format(boundaryCirculation(region().boundary, flippedProperty.value, fieldProperty.value), 4)}`,
    );
    const curlTotal = computed(
      properties,
      () =>
        `∬ (∇ × F)<sub>z</sub> dA = ${format(curlIntegral(fieldProperty.value, region().cells, flippedProperty.value), 4)}`,
    );
    const cellSum = computed(properties, () => {
      const sign = flippedProperty.value ? -1 : 1;
      const total = region().cells.reduce(
        (sum, cell) => sum + boundaryCirculation(cell, false, fieldProperty.value),
        0,
      );
      return `${s.cellSumStringProperty.value} = ${format(sign * total, 4)}`;
    });
    const pairs = computed(properties, () => `${region().shared.length} × (w − w) = 0`);
    const details = computed(
      [formula, stage, circulation, curlTotal, cellSum, pairs],
      () =>
        `${canvasText(formula.value)}. ${stage.value}. ${cellSum.value}. ${pairs.value}. ${circulation.value}. ${curlTotal.value.replace(/<[^>]+>/g, "")}.`,
    );

    const plane = new Plane(new Range(-1.6, 1.6), new Range(-1.55, 1.55));
    const plot = new PlotCanvas(properties, (context, colors) => {
      const { cells, boundary, shared } = region();
      const currentStage = stageProperty.value;
      const flipped = flippedProperty.value;
      plane.axes(context, colors);
      drawField(context, plane, fieldProperty.value, colors);
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
          if (cells.length <= MAX_LABELLED_CELLS) {
            const [x0, y0] = cell[0]?.[0] ?? [0, 0];
            const [x1, y1] = cell[1]?.[1] ?? [0, 0];
            const value = boundaryCirculation(cell, flipped, fieldProperty.value);
            const [cx, cy] = plane.project([(x0 + x1) / 2, (y0 + y1) / 2]);
            plotLabel(context, format(value), [cx - 14, cy + 4], colors.ink);
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
      plotLabel(context, canvasText(formula.value), [16, 25], colors.ink);
      plotLabel(context, stage.value, [16, 396], colors.ink);
    });
    const back = button(s.backStringProperty, () => {
      stageProperty.value = Math.max(0, stageProperty.value - 1);
    });
    const next = button(s.nextStringProperty, () => {
      stageProperty.value = Math.min(2, stageProperty.value + 1);
    });
    stageProperty.link((value) => {
      back.enabled = value > 0;
      next.enabled = value < 2;
    });
    const listParent = new Node();
    super(
      {
        title: headingStringProperty,
        summary: screenSummary,
        details,
        plot,
        listParent,
        controls: [
          comboBox(fieldProperty, fieldChoices(greenFields), listParent, s.fieldStringProperty),
          checkbox(s.lShapeStringProperty, lShapeProperty),
          slider(s.divisionsStringProperty, divisionsProperty, 1),
          new HBox({ spacing: 8, children: [back, next] }),
          checkbox(s.flippedStringProperty, flippedProperty),
        ],
        readouts: [stage, cellSum, pairs, circulation, curlTotal],
        reset: () => model.reset(),
      },
      options,
    );
  }
}
