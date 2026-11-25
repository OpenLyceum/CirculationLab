import { Multilink } from "scenerystack/axon";
import { Range, roundSymmetric } from "scenerystack/dot";
import { Circle, DragListener, Node } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import CirculationLabColors from "../../CirculationLabColors.js";
import { canvasText, drawField, fieldChoices } from "../../common/FieldPlot.js";
import {
  arrow,
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
import {
  fieldLabel,
  fields,
  isConservative,
  lineIntegral,
  type PathKind,
  type Point,
  pathBetween,
  pathKinds,
} from "../../common/model/VectorMath.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { SameDestinationDifferentWorkModel } from "../model/SameDestinationDifferentWorkModel.js";

const PATH_SAMPLES = 90;
/** Endpoints snap to this grid while dragged. */
const SNAP = 0.05;

export class SameDestinationDifferentWorkScreenView extends LabView {
  public constructor(model: SameDestinationDifferentWorkModel, options?: ScreenViewOptions) {
    const manager = StringManager.getInstance();
    const { controls: s, headingStringProperty, screenSummary } = manager.getSameDestinationDifferentWorkA11yStrings();
    const {
      fieldProperty,
      pathProperty,
      progressProperty,
      startXProperty,
      startYProperty,
      endXProperty,
      endYProperty,
      properties,
    } = model;
    const start = (): Point => [startXProperty.value, startYProperty.value];
    const end = (): Point => [endXProperty.value, endYProperty.value];
    const straight = () => pathBetween("segment", start(), end());
    const chosen = () => pathBetween(pathProperty.value, start(), end());
    const formula = computed([fieldProperty], () => `F = ${fieldLabel(fieldProperty.value)}`);
    const work = computed(properties, () => {
      const t = progressProperty.value;
      return `W<sub>1</sub>(t) = ${format(lineIntegral(fieldProperty.value, straight(), t), 4)}      W<sub>2</sub>(t) = ${format(lineIntegral(fieldProperty.value, chosen(), t), 4)}`;
    });
    // Out along the straight path and back along the chosen one.
    const loop = computed(properties, () => {
      const field = fieldProperty.value;
      return `${s.loopStringProperty.value}: ∮ F · dr = W<sub>1</sub> − W<sub>2</sub> = ${format(lineIntegral(field, straight()) - lineIntegral(field, chosen()), 4)}`;
    });
    const verdict = computed([fieldProperty, s.conservativeStringProperty, s.notConservativeStringProperty], () =>
      isConservative(fieldProperty.value) ? s.conservativeStringProperty.value : s.notConservativeStringProperty.value,
    );
    const plain = (markup: string) => markup.replace(/<[^>]+>/g, "");
    const details = computed(
      [formula, work, loop, verdict, progressProperty, pathProperty],
      () =>
        `${canvasText(formula.value)}. A = (${format(startXProperty.value)}, ${format(startYProperty.value)}), B = (${format(endXProperty.value)}, ${format(endYProperty.value)}). ${s[`${pathProperty.value}StringProperty`].value}. t = ${format(progressProperty.value)}. ${plain(work.value)}. ${plain(loop.value)}. ${verdict.value}`,
    );
    const plane = new Plane(new Range(-1.8, 1.8), new Range(-1.8, 1.8));
    const plot = new PlotCanvas(properties, (context, colors) => {
      plane.axes(context, colors);
      drawField(context, plane, fieldProperty.value, colors);
      for (const [path, color, number] of [
        [straight(), colors.accent, "1"],
        [chosen(), colors.alternate, "2"],
      ] as const) {
        const p = (t: number) => plane.project(path(t));
        const curve = (last: number) =>
          Array.from({ length: PATH_SAMPLES + 1 }, (_, i) => p((last * i) / PATH_SAMPLES));
        context.save();
        context.globalAlpha = 0.65;
        context.setLineDash([4, 4]);
        line(context, curve(1), color, 1.5);
        context.restore();
        line(context, curve(progressProperty.value), color, 4);
        arrow(context, p(0.42), p(0.5), color);
        dot(context, p(progressProperty.value), color, 5);
        const tag = p(0.67);
        plotLabel(context, number, [tag[0] + 5, tag[1] - 7], color);
      }
      const [a, b] = [plane.project(start()), plane.project(end())];
      plotLabel(context, "A", [a[0] - 16, a[1] + 18], colors.ink);
      plotLabel(context, "B", [b[0] + 8, b[1] + 18], colors.ink);
      plotLabel(context, canvasText(formula.value), [16, 25], colors.ink);
    });
    // Grips on A and B. They are pointer-only: the endpoints keep their defaults for keyboard use.
    const grip = (x: typeof startXProperty, y: typeof startYProperty) => {
      const node = new Circle(9, {
        fill: CirculationLabColors.textColorProperty,
        stroke: CirculationLabColors.panelBackgroundColorProperty,
        lineWidth: 2,
        cursor: "move",
      });
      node.touchArea = node.localBounds.dilated(10);
      const listener = new DragListener({
        drag: (event) => {
          const local = plot.globalToLocalPoint(event.pointer.point);
          const [mx, my] = plane.unproject([local.x, local.y]);
          x.value = x.range.constrainValue(roundSymmetric(mx / SNAP) * SNAP);
          y.value = y.range.constrainValue(roundSymmetric(my / SNAP) * SNAP);
        },
      });
      node.addInputListener(listener);
      plot.addChild(node);
      plot.addDisposable(listener, node);
      Multilink.multilink([x, y], (px, py) => {
        const [sx, sy] = plane.project([px, py]);
        node.setTranslation(sx, sy);
      });
    };
    grip(startXProperty, startYProperty);
    grip(endXProperty, endYProperty);
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
          comboBox(
            pathProperty,
            pathKinds
              .filter((kind) => kind !== "segment")
              .map((kind: PathKind) => ({ value: kind, label: s[`${kind}StringProperty`] })),
            listParent,
            s.pathStringProperty,
          ),
          slider(s.progressStringProperty, progressProperty, 0.02),
        ],
        readouts: [formula, work, loop, verdict],
        reset: () => model.reset(),
      },
      options,
    );
  }
}
