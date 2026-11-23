import { Shape } from "scenerystack/kite";
import { Node, Path, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import Colors from "../CirculationLabColors.js";

const WIDTH = 548;
const HEIGHT = 373;

function iconFrom(...paths: string[]): ScreenIcon {
  const background = new Rectangle(0, 0, WIDTH, HEIGHT, { fill: Colors.panelBackgroundColorProperty });
  const graphic = paths.map(
    (path, index) =>
      new Path(new Shape(path), {
        stroke: index === 0 ? Colors.accentColorProperty : Colors.secondaryPlotColorProperty,
        lineWidth: 12,
        lineJoin: "round",
        lineCap: "round",
      }),
  );
  return new ScreenIcon(new Node({ children: [background, ...graphic] }), {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: Colors.backgroundColorProperty,
  });
}

export function createSameDestinationDifferentWorkIcon(): ScreenIcon {
  return iconFrom(
    "M100 246 C100 36 448 36 448 246 M329 101 L362 113 L338 127",
    "M100 246 L448 246 M302 224 L326 246 L302 270",
  );
}

export function createFluxThroughAGateIcon(): ScreenIcon {
  return iconFrom(
    "M124 285 L385 105",
    "M240 204 L180 111 M176 146 L180 111 L213 126",
    "M109 107 L155 107 M143 94 L155 107 L143 120 M334 266 L394 266 M380 251 L394 266 L380 281",
  );
}

export function createDivergenceVsCurlIcon(): ScreenIcon {
  return iconFrom(
    "M178 90 L360 90 L360 274 L178 274 Z",
    "M268 90 L268 37 M250 55 L268 37 L286 55 M360 183 L430 183 M411 164 L430 183 L411 202 M178 183 L110 183 M129 164 L110 183 L129 202 M268 274 L268 331 M249 312 L268 331 L287 312",
  );
}

export function createGreensTheoremByCancellationIcon(): ScreenIcon {
  return iconFrom(
    "M127 64 L417 64 L417 296 L127 296 Z M272 64 L272 296 M127 180 L417 180",
    "M234 203 L234 151 M219 167 L234 151 L249 167 M307 155 L307 210 M292 194 L307 210 L322 194",
  );
}

export function createOneRimTwoSurfacesIcon(): ScreenIcon {
  return iconFrom(
    "M100 248 C136 193 414 193 448 248 C410 298 139 298 100 248 Z",
    "M100 248 Q265 -54 448 248 M163 258 Q273 58 389 264 M228 270 Q265 95 321 271",
    "M274 128 L274 56 M254 78 L274 56 L294 78",
  );
}
