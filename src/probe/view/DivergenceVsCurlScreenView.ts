import { Range } from "scenerystack/dot";
import { Node } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import { canvasText, drawField, fieldChoices, midpoint } from "../../common/FieldPlot.js";
import {
  addPointDrag,
  arrow,
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
import { curl, divergence, fieldLabel, fields, probeTotals, squareEdges } from "../../common/model/VectorMath.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { DivergenceVsCurlModel } from "../model/DivergenceVsCurlModel.js";

export class DivergenceVsCurlScreenView extends LabView {
  public constructor(model: DivergenceVsCurlModel, options?: ScreenViewOptions) {
    const manager = StringManager.getInstance();
    const { controls: s, headingStringProperty, screenSummary } = manager.getDivergenceVsCurlA11yStrings();
    const { fieldProperty, xProperty, yProperty, sizeProperty, circulationProperty, properties } = model;
    const formula = computed([fieldProperty], () => `F = ${fieldLabel(fieldProperty.value)}`);
    const edges = () => squareEdges([xProperty.value, yProperty.value], sizeProperty.value);
    const totals = () => probeTotals(fieldProperty.value, edges());
    const totalsText = computed(properties, () => {
      const { netFlux, netCirculation } = totals();
      return `∮ F · n ds = ${format(netFlux)}     ∮ F · dr = ${format(netCirculation)}`;
    });
    const normalized = computed(properties, () => {
      const area = sizeProperty.value ** 2;
      const { netFlux, netCirculation } = totals();
      return `∮ F · n ds / A = ${format(netFlux / area, 3)}      ∮ F · dr / A = ${format(netCirculation / area, 3)}`;
    });
    // What the ratios approach as the square shrinks onto its centre.
    const exact = computed(properties, () => {
      const at = [xProperty.value, yProperty.value] as const;
      return `${s.limitStringProperty.value}  ∇ · F = ${format(divergence(fieldProperty.value, at), 3)}   (∇ × F)<sub>z</sub> = ${format(curl(fieldProperty.value, at), 3)}`;
    });
    const sides = computed(properties, () => {
      const result = totals();
      const values = circulationProperty.value ? result.circulation : result.flux;
      const formulaSymbol = circulationProperty.value ? "F · dr" : "F · n ds";
      return `${formulaSymbol} ①–④: ${values.map((value) => format(value)).join(" / ")}`;
    });
    const details = computed(
      [formula, totalsText, normalized, exact, sides, xProperty, yProperty, sizeProperty],
      () =>
        `${canvasText(formula.value)}. (x, y) = (${format(xProperty.value)}, ${format(yProperty.value)}). A = ${format(sizeProperty.value ** 2)}. ${totalsText.value}. ${normalized.value}. ${exact.value.replace(/<[^>]+>/g, "")}. ${sides.value}.`,
    );
    const plane = new Plane(new Range(-2.55, 2.55), new Range(-2.55, 2.55));
    const plot = new PlotCanvas(properties, (context, colors) => {
      plane.axes(context, colors);
      drawField(context, plane, fieldProperty.value, colors);
      const result = totals();
      edges().forEach((edge, index) => {
        const [[x, y], [a, b]] = edge;
        const [u, v] = midpoint(edge);
        line(context, edge.map(plane.project), colors.accent, 3);
        const length = sizeProperty.value;
        const tx = (a - x) / length;
        const ty = (b - y) / length;
        const nx = ty;
        const ny = -tx;
        const circulation = circulationProperty.value;
        const contribution = (circulation ? result.circulation : result.flux)[index] ?? 0;
        // Each arrow's length is the edge's contribution per unit length, on a shared scale.
        const largest = Math.max(1e-9, ...(circulation ? result.circulation : result.flux).map(Math.abs));
        const reach = (0.4 * contribution) / largest;
        const tail = plane.project([u + 0.1 * nx, v + 0.1 * ny]);
        const tip = plane.project([
          u + 0.1 * nx + reach * (circulation ? tx : nx),
          v + 0.1 * ny + reach * (circulation ? ty : ny),
        ]);
        arrow(context, tail, tip, colors.alternate);
        const caption = ["①", "②", "③", "④"][index];
        plotLabel(
          context,
          `${caption} ${format(contribution)}`,
          plane.project([u + 0.44 * nx + 0.08, v + 0.44 * ny]),
          colors.ink,
        );
      });
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
          slider(s.xStringProperty, xProperty, 0.05),
          slider(s.yStringProperty, yProperty, 0.05),
          slider(s.sizeStringProperty, sizeProperty, 0.1),
          checkbox(s.circulationStringProperty, circulationProperty),
        ],
        readouts: [formula, totalsText, normalized, exact, sides],
        reset: () => model.reset(),
      },
      options,
    );
  }
}
