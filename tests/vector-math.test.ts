import { describe, expect, it } from "vitest";
import {
  boundaryCirculation,
  capNormal,
  capPoint,
  capShapes,
  curl,
  curlIntegral,
  divergence,
  fields,
  fieldVector,
  gateFlux,
  gateGeometry,
  isConservative,
  lineIntegral,
  pathBetween,
  pathKinds,
  probeTotals,
  squareEdges,
  stokesTotals,
  tiledRegion,
} from "../src/common/model/VectorMath.js";
import { orthographic } from "../src/common/Projection.js";

describe("work along paths", () => {
  it("is path-independent exactly for the curl-free fields", () => {
    const a = [-1, 0] as const;
    const b = [1, 0.3] as const;
    for (const field of fields) {
      const works = pathKinds.map((kind) => lineIntegral(field, pathBetween(kind, a, b)));
      const spread = Math.max(...works) - Math.min(...works);
      if (isConservative(field)) {
        expect(spread).toBeLessThan(1e-6);
      } else {
        expect(spread).toBeGreaterThan(1e-3);
      }
    }
  });

  it("matches the potential for the gradient field and the swept area for the rotation", () => {
    const potential = ([x, y]: readonly [number, number]) => x + (x * x + y * y) / 2;
    const upper = pathBetween("upperArc", [-1, 0], [1, 0]);
    expect(lineIntegral("gradient", upper)).toBeCloseTo(potential([1, 0]) - potential([-1, 0]), 6);
    // (−y/2, x/2) along the upper half circle from (−1, 0) to (1, 0), clockwise: −π/2.
    expect(lineIntegral("halfRotation", upper)).toBeCloseTo(-Math.PI / 2, 8);
    expect(lineIntegral("halfRotation", upper, 0.5)).toBeCloseTo(-Math.PI / 4, 8);
    expect(upper(0.5)[1]).toBeCloseTo(1, 12);
  });
});

describe("field library", () => {
  it("pairs every field with its divergence and curl", () => {
    const h = 1e-5;
    for (const field of fields) {
      for (const point of [
        [0.3, -0.7],
        [-1.1, 0.4],
      ] as const) {
        const [x, y] = point;
        const dPdx = (fieldVector(field, [x + h, y])[0] - fieldVector(field, [x - h, y])[0]) / (2 * h);
        const dQdy = (fieldVector(field, [x, y + h])[1] - fieldVector(field, [x, y - h])[1]) / (2 * h);
        const dQdx = (fieldVector(field, [x + h, y])[1] - fieldVector(field, [x - h, y])[1]) / (2 * h);
        const dPdy = (fieldVector(field, [x, y + h])[0] - fieldVector(field, [x, y - h])[0]) / (2 * h);
        expect(divergence(field, point)).toBeCloseTo(dPdx + dQdy, 6);
        expect(curl(field, point)).toBeCloseTo(dQdx - dPdy, 6);
      }
    }
  });
});

describe("flux and circulation", () => {
  it("gives zero flux parallel to the gate and flips sign with the selected normal", () => {
    expect(gateFlux("uniform", [0, 0], 0, false)).toBeCloseTo(0, 12);
    expect(gateFlux("uniform", [0, 0], 90, false)).toBeCloseTo(-1.4, 12);
    expect(gateFlux("uniform", [0, 0], 90, true)).toBeCloseTo(1.4, 12);
    expect(gateFlux("source", [0, 1], 0, false)).toBeCloseTo(1.4, 12);
    expect(gateGeometry([0, 0], 90, false).normal[0]).toBeCloseTo(-1, 12);
  });

  it("converges to the local divergence and curl as the probe shrinks", () => {
    const center = [0.6, -0.4] as const;
    for (const field of ["stretch", "mixed", "waves", "swirl"] as const) {
      const ratio = (size: number) => {
        const { netFlux, netCirculation } = probeTotals(field, squareEdges(center, size));
        return [netFlux / size ** 2, netCirculation / size ** 2] as const;
      };
      const [coarseDiv, coarseCurl] = ratio(1.2);
      const [fineDiv, fineCurl] = ratio(0.1);
      expect(Math.abs(fineDiv - divergence(field, center))).toBeLessThanOrEqual(
        Math.abs(coarseDiv - divergence(field, center)) + 1e-9,
      );
      expect(fineDiv).toBeCloseTo(divergence(field, center), 2);
      expect(fineCurl).toBeCloseTo(curl(field, center), 2);
      expect(Number.isFinite(coarseCurl)).toBe(true);
    }
  });

  it("recovers the derivatives at different probe scales and locations", () => {
    for (const [field, expectedDivergence, expectedCurl] of [
      ["source", 2, 0],
      ["rotation", 0, 2],
      ["shear", 0, -1],
    ] as const) {
      for (const size of [0.4, 1, 1.6]) {
        const result = probeTotals(field, squareEdges([0.73, -0.43], size));
        expect(result.netFlux / size ** 2).toBeCloseTo(expectedDivergence, 9);
        expect(result.netCirculation / size ** 2).toBeCloseTo(expectedCurl, 9);
      }
    }
  });
});

describe("integral theorems", () => {
  it("cancels all shared edges and recovers signed area from the exterior edges", () => {
    for (const lShape of [false, true]) {
      for (const divisions of [1, 2, 4]) {
        const { area, cells, boundary, shared } = tiledRegion(divisions, lShape);
        expect(area).toBe(lShape ? 3 : 4);
        expect(cells.length * 4).toBe(boundary.length + shared.length * 2);
        expect(boundaryCirculation(cells.flat(), false)).toBeCloseTo(area, 9);
        expect(boundaryCirculation(boundary, false)).toBeCloseTo(area, 9);
        expect(boundaryCirculation(boundary, true)).toBeCloseTo(-area, 9);
        for (const [a, b] of shared) {
          expect(
            boundaryCirculation(
              [
                [a, b],
                [b, a],
              ],
              false,
            ),
          ).toBeCloseTo(0, 9);
        }
      }
    }
  });

  it("equates boundary circulation with the curl integral for every field", () => {
    for (const field of ["halfRotation", "mixed", "waves", "swirl"] as const) {
      for (const lShape of [false, true]) {
        const { cells, boundary } = tiledRegion(2, lShape);
        expect(boundaryCirculation(boundary, false, field)).toBeCloseTo(curlIntegral(field, cells, false), 5);
      }
    }
  });

  it("projects a positively oriented rim counterclockwise when viewed from above", () => {
    for (const yaw of [-75, -25, 40]) {
      const project = orthographic(yaw, 31, 126, [0, 0]);
      const [x, y] = project([1, 0, 0]).point;
      const [a, b] = project([0, 1, 0]).point;
      // Screen y increases downward, so a counterclockwise turn has negative determinant.
      expect(x * b - y * a).toBeLessThan(0);
      expect(project([0, 0, 1]).point[1]).toBeLessThan(0);
    }
  });

  it("gives the same curl flux through every cap shape", () => {
    for (const shape of capShapes) {
      for (const h of [0.3, 1.2]) {
        expect(stokesTotals(h, false, shape).curlFlux).toBeCloseTo(Math.PI, 3);
        expect(capPoint(1, 0.7, h, shape)[2]).toBeCloseTo(0, 12);
      }
    }
  });

  it("preserves the rim and the Stokes totals across cap heights", () => {
    for (const h of [0, 0.25, 0.85, 1.5]) {
      expect(capPoint(1, Math.PI / 3, h)[2]).toBe(0);
      const normal = capNormal(capPoint(0.6, Math.PI / 3, h), h, false);
      expect(Math.hypot(...normal)).toBeCloseTo(1, 12);
      expect(normal[2]).toBeGreaterThan(0);
      for (const flipped of [false, true]) {
        const { rimCirculation, curlFlux } = stokesTotals(h, flipped);
        expect(rimCirculation).toBeCloseTo(flipped ? -Math.PI : Math.PI, 12);
        expect(curlFlux).toBeCloseTo(rimCirculation, 12);
      }
    }
  });
});
