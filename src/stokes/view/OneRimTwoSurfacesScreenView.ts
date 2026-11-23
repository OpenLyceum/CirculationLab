import type { ScreenViewOptions } from "scenerystack/sim";
import {
  arrow,
  checkbox,
  computed,
  dot,
  format,
  LabView,
  line,
  PlotCanvas,
  plotLabel,
  slider,
} from "../../common/LabView.js";
import { capNormal, capPoint, type Point3, stokesTotals } from "../../common/model/VectorMath.js";
import { orthographic } from "../../common/Projection.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { OneRimTwoSurfacesModel } from "../model/OneRimTwoSurfacesModel.js";

const FULL_TURN = 2 * Math.PI;
const RINGS = 6;
const SECTORS = 32;

export class OneRimTwoSurfacesScreenView extends LabView {
  public constructor(model: OneRimTwoSurfacesModel, options?: ScreenViewOptions) {
    const manager = StringManager.getInstance();
    const { controls: s, headingStringProperty, screenSummary } = manager.getOneRimTwoSurfacesA11yStrings();
    const { heightProperty, rotationProperty, flippedProperty, properties } = model;
    const totals = () => stokesTotals(heightProperty.value, flippedProperty.value);
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
      [heightProperty, flippedProperty, s.capFluxStringProperty],
      () => `${s.capFluxStringProperty.value} = ${signedFlux(totals().curlFlux)}`,
    );
    const details = computed(
      [heightProperty, circulation, diskFlux, capFlux],
      () =>
        `${s.heightStringProperty.value} ${format(heightProperty.value)}. ${circulation.value}. ${diskFlux.value}. ${capFlux.value}.`,
    );
    const plot = new PlotCanvas(properties, (context, colors) => {
      const project = orthographic(rotationProperty.value, 31, 126, [295, 276]);
      const xy = (p: Point3) => project(p).point;
      const height = heightProperty.value;
      const flipped = flippedProperty.value;
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
          capPoint(inner, angle, height),
          capPoint(outer, angle, height),
          capPoint(outer, next, height),
          capPoint(inner, next, height),
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
        const p = capPoint(0.51, theta, height);
        const n = capNormal(p, height, flipped);
        const tip = xy([p[0] + 0.4 * n[0], p[1] + 0.4 * n[1], p[2] + 0.4 * n[2]]);
        dot(context, xy(p), colors.ink, 3);
        arrow(context, xy(p), tip, colors.ink);
        plotLabel(context, "n", [tip[0] + 4, tip[1] - 3], colors.ink);
      }
      plotLabel(context, "z = h(1 − x² − y²)", [16, 25], colors.ink);
      plotLabel(context, "∇ × F = (0, 0, 1)", [16, 396], colors.ink);
    });
    super(
      {
        title: headingStringProperty,
        summary: screenSummary,
        details,
        plot,
        controls: [
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
