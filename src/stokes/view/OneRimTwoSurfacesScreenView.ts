import { DragListener, Node, Rectangle } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import {
  arrow,
  checkbox,
  comboBox,
  computed,
  dot,
  format,
  LabView,
  line,
  PlotCanvas,
  plotLabel,
  slider,
} from "../../common/LabView.js";
import { capNormal, capPoint, capShapes, type Point3, stokesTotals } from "../../common/model/VectorMath.js";
import { orthographic } from "../../common/Projection.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { OneRimTwoSurfacesModel } from "../model/OneRimTwoSurfacesModel.js";

const FULL_TURN = 2 * Math.PI;
const RINGS = 6;
const SECTORS = 32;
// Degrees of yaw per pixel of horizontal drag on the view.
const YAW_PER_PIXEL = 0.4;
const SHAPE_LABELS = { paraboloid: "z = h(1 − x² − y²)", dome: "z = h√(1 − x² − y²)", cone: "z = h(1 − √(x² + y²))" };

export class OneRimTwoSurfacesScreenView extends LabView {
  public constructor(model: OneRimTwoSurfacesModel, options?: ScreenViewOptions) {
    const manager = StringManager.getInstance();
    const { controls: s, headingStringProperty, screenSummary } = manager.getOneRimTwoSurfacesA11yStrings();
    const { shapeProperty, heightProperty, rotationProperty, flippedProperty, properties } = model;
    const totals = () => stokesTotals(heightProperty.value, flippedProperty.value, shapeProperty.value);
    const circulation = computed(
      properties,
      () => `∮ F · dr = ${flippedProperty.value ? "−" : ""}π ≈ ${format(totals().rimCirculation, 5)}`,
    );
    const signedFlux = (flux: number) => `${flippedProperty.value ? "−" : ""}π ≈ ${format(flux, 5)}`;
    const diskFlux = computed(
      [flippedProperty, s.diskFluxStringProperty],
      () => `${s.diskFluxStringProperty.value} = ${signedFlux(stokesTotals(0, flippedProperty.value).curlFlux)}`,
    );
    const capFlux = computed(
      [shapeProperty, heightProperty, flippedProperty, s.capFluxStringProperty],
      () => `${s.capFluxStringProperty.value} = ${signedFlux(totals().curlFlux)}`,
    );
    const details = computed(
      [shapeProperty, heightProperty, circulation, diskFlux, capFlux],
      () =>
        `${s[`${shapeProperty.value}StringProperty`].value}. ${SHAPE_LABELS[shapeProperty.value]}. ${s.heightStringProperty.value} ${format(heightProperty.value)}. ${circulation.value}. ${diskFlux.value}. ${capFlux.value}.`,
    );
    const plot = new PlotCanvas(properties, (context, colors) => {
      const project = orthographic(rotationProperty.value, 31, 126, [295, 276]);
      const xy = (p: Point3) => project(p).point;
      const height = heightProperty.value;
      const flipped = flippedProperty.value;
      const shape = shapeProperty.value;
      const rim = Array.from({ length: SECTORS + 1 }, (_, i) => xy(capPoint(1, (i * FULL_TURN) / SECTORS, 0)));
      context.globalAlpha = 0.15;
      line(context, rim, colors.ink, 1, colors.ink);
      context.globalAlpha = 1;
      const faces = Array.from({ length: RINGS * SECTORS }, (_, index) => {
        const ring = Math.floor(index / SECTORS);
        const angle = ((index % SECTORS) * FULL_TURN) / SECTORS;
        const next = angle + FULL_TURN / SECTORS;
        const inner = ring / RINGS;
        const outer = (ring + 1) / RINGS;
        const corners = [
          capPoint(inner, angle, height, shape),
          capPoint(outer, angle, height, shape),
          capPoint(outer, next, height, shape),
          capPoint(inner, next, height, shape),
        ];
        return { corners, depth: corners.reduce((sum, point) => sum + project(point).depth, 0) / 4 };
      });
      faces.sort((a, b) => a.depth - b.depth);
      context.globalAlpha = 0.32;
      for (const face of faces) {
        line(context, face.corners.map(xy), colors.accent, 0.8, colors.accent);
      }
      context.globalAlpha = 1;
      line(context, rim, colors.alternate, 3);
      for (let index = 0; index < 6; index++) {
        const angle = (index * FULL_TURN) / 6;
        const from = xy(capPoint(1, angle - 0.11, 0));
        const to = xy(capPoint(1, angle + 0.11, 0));
        arrow(context, flipped ? to : from, flipped ? from : to, colors.alternate, 2.5);
      }
      for (const theta of [0, FULL_TURN / 3, (2 * FULL_TURN) / 3]) {
        const p = capPoint(0.51, theta, height, shape);
        const n = capNormal(p, height, flipped, shape);
        const tip = xy([p[0] + 0.4 * n[0], p[1] + 0.4 * n[1], p[2] + 0.4 * n[2]]);
        dot(context, xy(p), colors.ink, 3);
        arrow(context, xy(p), tip, colors.ink);
        plotLabel(context, "n", [tip[0] + 4, tip[1] - 3], colors.ink);
      }
      // curl F = (0, 0, 1) at a few points of the surface: the flux through it is what Stokes compares.
      for (const [radius, theta] of [
        [0.25, 0.4],
        [0.7, 2.2],
        [0.7, 4.3],
        [0, 0],
      ] as const) {
        const p = capPoint(radius, theta, height, shape);
        arrow(context, xy(p), xy([p[0], p[1], p[2] + 0.35]), colors.alternate, 1.5);
      }
      plotLabel(context, SHAPE_LABELS[shape], [16, 25], colors.ink);
      plotLabel(context, "∇ × F = (0, 0, 1)", [16, 396], colors.ink);
    });
    // Dragging sideways on the view turns it; the view-angle slider owns the keyboard path.
    const turn = new Rectangle(0, 0, 590, 420, { fill: "transparent", cursor: "ew-resize" });
    let lastX = 0;
    const turnListener = new DragListener({
      start: (event) => {
        lastX = event.pointer.point.x;
      },
      drag: (event) => {
        const next = rotationProperty.value + (event.pointer.point.x - lastX) * YAW_PER_PIXEL;
        lastX = event.pointer.point.x;
        rotationProperty.value = rotationProperty.range.constrainValue(next);
      },
    });
    turn.addInputListener(turnListener);
    plot.addChild(turn);
    plot.addDisposable(turnListener, turn);
    const listParent = new Node();
    super(
      {
        title: headingStringProperty,
        summary: screenSummary,
        details,
        plot,
        listParent,
        controls: [
          comboBox(
            shapeProperty,
            capShapes.map((shape) => ({ value: shape, label: s[`${shape}StringProperty`] })),
            listParent,
            s.shapeStringProperty,
          ),
          slider(s.heightStringProperty, heightProperty, 0.05),
          slider(s.rotationStringProperty, rotationProperty, 5, "°"),
          checkbox(s.flippedStringProperty, flippedProperty),
        ],
        readouts: ["F = (−y/2, x/2, 0)", circulation, diskFlux, capFlux],
        reset: () => model.reset(),
      },
      options,
    );
  }
}
