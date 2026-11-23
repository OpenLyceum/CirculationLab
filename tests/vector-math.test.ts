import { describe, expect, it } from "vitest";
import {
  boundaryCirculation,
  capNormal,
  capPoint,
  edgeContribution,
  gateFlux,
  gateGeometry,
  pathPoint,
  pathWork,
  probeTotals,
  squareEdges,
  stokesTotals,
  tiledRegion,
} from "../src/common/model/VectorMath.js";
import { orthographic } from "../src/common/Projection.js";

describe("work along paths", () => {
  it("coincides for the gradient field and differs for the rotational field", () => {
    expect(pathWork("gradient", "segment", 1, false)).toBe(2);
    expect(pathWork("gradient", "semicircle", 1, false)).toBe(2);
    expect(pathWork("halfRotation", "segment", 1, false)).toBe(0);
    expect(pathWork("halfRotation", "semicircle", 1, false)).toBeCloseTo(-Math.PI / 2, 12);
    expect(pathPoint("semicircle", 0.5)[1]).toBe(1);
  });

  it("accumulates only the traversed work and reverses the completed sign", () => {
    expect(pathWork("halfRotation", "semicircle", 0.5, false)).toBeCloseTo(-Math.PI / 4, 12);
    expect(pathWork("halfRotation", "semicircle", 1, true)).toBeCloseTo(Math.PI / 2, 12);
    expect(pathWork("gradient", "segment", 1, true)).toBe(-2);
    expect(pathWork("gradient", "semicircle", 0, true)).toBe(0);
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

  it("recovers the derivatives at different probe scales and locations", () => {
    for (const [field, divergence, curl] of [
      ["source", 2, 0],
      ["rotation", 0, 2],
      ["shear", 0, -1],
    ] as const) {
      for (const size of [0.4, 1, 1.6]) {
        const result = probeTotals(field, squareEdges([0.73, -0.43], size));
        expect(result.netFlux / size ** 2).toBeCloseTo(divergence, 12);
        expect(result.netCirculation / size ** 2).toBeCloseTo(curl, 12);
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
        expect(boundaryCirculation(cells.flat(), false)).toBeCloseTo(area, 12);
        expect(boundaryCirculation(boundary, false)).toBeCloseTo(area, 12);
        expect(boundaryCirculation(boundary, true)).toBeCloseTo(-area, 12);
        for (const [a, b] of shared) {
          expect(edgeContribution("halfRotation", [a, b]) + edgeContribution("halfRotation", [b, a])).toBeCloseTo(
            0,
            12,
          );
        }
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
