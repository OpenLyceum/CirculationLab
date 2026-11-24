import { Range } from "scenerystack/dot";
import type { ScreenViewOptions } from "scenerystack/sim";
import { drawField, midpoint } from "../../common/FieldPlot.js";
import {
  addPointDrag,
  arrow,
  checkbox,
  choice,
  computed,
  format,
  LabView,
  line,
  Plane,
  PlotCanvas,
  plotLabel,
  slider,
} from "../../common/LabView.js";
import { probeTotals, squareEdges } from "../../common/model/VectorMath.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { DivergenceVsCurlModel } from "../model/DivergenceVsCurlModel.js";

export class DivergenceVsCurlScreenView extends LabView {
  public constructor(model: DivergenceVsCurlModel, options?: ScreenViewOptions) {
    const manager = StringManager.getInstance();
    const { controls: s, headingStringProperty, screenSummary } = manager.getDivergenceVsCurlA11yStrings();
    const { fieldProperty, xProperty, yProperty, sizeProperty, circulationProperty, properties } = model;
    const fieldNames = {
      source: s.sourceStringProperty,
      rotation: s.rotationStringProperty,
      shear: s.shearStringProperty,
    };
    const formulas = { source: "F = (x, y)", rotation: "F = (−y, x)", shear: "F = (y, 0)" };
    const fieldName = computed(
      [fieldProperty, ...Object.values(fieldNames)],
      () => fieldNames[fieldProperty.value].value,
    );
    const formula = computed([fieldProperty], () => formulas[fieldProperty.value]);
    const edges = () => squareEdges([xProperty.value, yProperty.value], sizeProperty.value);
    const totals = () => probeTotals(fieldProperty.value, edges());
    const totalsText = computed(properties, () => {
      const { netFlux, netCirculation } = totals();
      return `∮ F · n ds = ${format(netFlux)}     ∮ F · dr = ${format(netCirculation)}`;
    });
    const normalized = computed(properties, () => {
      const area = sizeProperty.value ** 2;
      const { netFlux, netCirculation } = totals();
      return `∇ · F = ${format(netFlux / area)}      (∇ × F)z = ${format(netCirculation / area)}`;
    });
    const sides = computed(properties, () => {
      const result = totals();
      const values = circulationProperty.value ? result.circulation : result.flux;
      const formulaSymbol = circulationProperty.value ? "F · dr" : "F · n ds";
      return `${formulaSymbol} ①–④: ${values.map((value) => format(value)).join(" / ")}`;
    });
    const details = computed(
      [formula, fieldName, totalsText, normalized, sides, xProperty, yProperty, sizeProperty],
      () =>
        `${fieldName.value}. ${formula.value}. (x, y) = (${format(xProperty.value)}, ${format(yProperty.value)}). A = ${format(sizeProperty.value ** 2)}. ${totalsText.value}. ${normalized.value}. ${sides.value}.`,
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
        const tail = plane.project([u + 0.1 * nx, v + 0.1 * ny]);
        const tip = plane.project([
          u + 0.1 * nx + 0.26 * (circulation ? tx : nx),
          v + 0.1 * ny + 0.26 * (circulation ? ty : ny),
        ]);
        arrow(context, tail, tip, colors.alternate);
        const contribution = (circulation ? result.circulation : result.flux)[index] ?? 0;
        const caption = ["①", "②", "③", "④"][index];
        plotLabel(
          context,
          `${caption} ${format(contribution)}`,
          plane.project([u + 0.44 * nx + 0.08, v + 0.44 * ny]),
          colors.ink,
        );
      });
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
            const next = { source: "rotation", rotation: "shear", shear: "source" } as const;
            fieldProperty.value = next[fieldProperty.value];
          }),
          slider(s.xStringProperty, xProperty, 0.05),
          slider(s.yStringProperty, yProperty, 0.05),
          slider(s.sizeStringProperty, sizeProperty, 0.1),
          checkbox(s.circulationStringProperty, circulationProperty),
        ],
        readouts: [formula, totalsText, normalized, sides],
        reset: () => model.reset(),
      },
      options,
    );
  }
}
