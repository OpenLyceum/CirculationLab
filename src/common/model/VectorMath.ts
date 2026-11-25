import { DEFAULT_GATE_LENGTH, SIMPSON_PANELS } from "../../CirculationLabConstants.js";

export type Point = readonly [number, number];
export type Point3 = readonly [number, number, number];
export type Edge = readonly [Point, Point];

/**
 * The plane fields. The affine ones (uniform … gradient) have constant divergence and curl; the
 * rest vary from place to place, so a shrinking probe has something to converge to.
 */
export const fields = [
  "uniform",
  "source",
  "rotation",
  "halfRotation",
  "shear",
  "gradient",
  "stretch",
  "mixed",
  "waves",
  "swirl",
] as const;
export type Field = (typeof fields)[number];

type FieldEntry = {
  /** F(x, y) as RichText markup. */
  readonly label: string;
  readonly F: (x: number, y: number) => Point;
  readonly divergence: (x: number, y: number) => number;
  readonly curl: (x: number, y: number) => number;
};

const gauss = (x: number, y: number) => Math.exp(-(x * x + y * y) / 2);

const library: Readonly<Record<Field, FieldEntry>> = {
  uniform: { label: "(1, 0)", F: () => [1, 0], divergence: () => 0, curl: () => 0 },
  source: { label: "(x, y)", F: (x, y) => [x, y], divergence: () => 2, curl: () => 0 },
  rotation: { label: "(−y, x)", F: (x, y) => [-y, x], divergence: () => 0, curl: () => 2 },
  halfRotation: { label: "(−y/2, x/2)", F: (x, y) => [-y / 2, x / 2], divergence: () => 0, curl: () => 1 },
  shear: { label: "(y, 0)", F: (_x, y) => [y, 0], divergence: () => 0, curl: () => -1 },
  gradient: { label: "(1 + x, y)", F: (x, y) => [1 + x, y], divergence: () => 2, curl: () => 0 },
  stretch: {
    label: "(x<sup>2</sup>, y)",
    F: (x, y) => [x * x, y],
    divergence: (x) => 2 * x + 1,
    curl: () => 0,
  },
  mixed: { label: "(xy, x − y)", F: (x, y) => [x * y, x - y], divergence: (_x, y) => y - 1, curl: (x) => 1 - x },
  waves: {
    label: "(sin y, cos x)",
    F: (x, y) => [Math.sin(y), Math.cos(x)],
    divergence: () => 0,
    curl: (x, y) => -Math.sin(x) - Math.cos(y),
  },
  // A vortex whose spin reverses at r = √2: curl = (2 − r²) e^(−r²/2).
  swirl: {
    label: "e<sup>−r²/2</sup>(−y, x)",
    F: (x, y) => [-y * gauss(x, y), x * gauss(x, y)],
    divergence: () => 0,
    curl: (x, y) => (2 - x * x - y * y) * gauss(x, y),
  },
};

export function fieldLabel(field: Field): string {
  return library[field].label;
}

export function fieldVector(field: Field, [x, y]: Point): Point {
  return library[field].F(x, y);
}

export function divergence(field: Field, [x, y]: Point): number {
  return library[field].divergence(x, y);
}

export function curl(field: Field, [x, y]: Point): number {
  return library[field].curl(x, y);
}

/** True when the field has zero curl everywhere, so its work depends only on the endpoints. */
export function isConservative(field: Field): boolean {
  return field === "uniform" || field === "source" || field === "gradient" || field === "stretch";
}

/** Composite Simpson's rule with an even number of panels. */
function simpson(g: (t: number) => number, from: number, to: number, panels = SIMPSON_PANELS): number {
  if (to === from) {
    return 0;
  }
  const h = (to - from) / panels;
  let weighted = g(from) + g(to);
  for (let i = 1; i < panels; i++) {
    weighted += (i % 2 === 1 ? 4 : 2) * g(from + i * h);
  }
  return (weighted * h) / 3;
}

/** A path r(t) for t ∈ [0, 1], smooth between its optional `corners` (values of t). */
export type Path = ((t: number) => Point) & { readonly corners?: readonly number[] };

/**
 * ∫ F · dr (work) or ∫ F · n ds (flux, n = r′ turned clockwise, to the right of travel)
 * along r(t) from t = 0 to t = end. Each smooth piece between corners is integrated on its own,
 * with r′ by differences kept inside the piece.
 */
export function lineIntegral(field: Field, path: Path, end = 1, flux = false): number {
  const stops = [0, ...(path.corners ?? []).filter((t) => t > 0 && t < end), end];
  let total = 0;
  for (let k = 0; k < stops.length - 1; k++) {
    const low = stops[k] ?? 0;
    const high = stops[k + 1] ?? end;
    total += simpson(
      (t) => {
        const h = 1e-6;
        const before = Math.max(low, t - h);
        const after = Math.min(high, t + h);
        const [a, b] = path(before);
        const [c, d] = path(after);
        const dx = (c - a) / (after - before);
        const dy = (d - b) / (after - before);
        const [p, q] = fieldVector(field, path(t));
        return flux ? p * dy - q * dx : p * dx + q * dy;
      },
      low,
      high,
    );
  }
  return total;
}

/** The paths from A to B on the Work screen. */
export const pathKinds = ["segment", "upperArc", "lowerArc", "detour"] as const;
export type PathKind = (typeof pathKinds)[number];

/**
 * A path from a to b: the straight segment; the half circles on AB as a diameter, to the left
 * (upper) or right (lower) of travel; or a detour that climbs one unit, crosses, and comes down.
 */
export function pathBetween(kind: PathKind, a: Point, b: Point): Path {
  const [ax, ay] = a;
  const [bx, by] = b;
  const [cx, cy] = [(ax + bx) / 2, (ay + by) / 2];
  const half = Math.hypot(bx - ax, by - ay) / 2;
  const start = Math.atan2(ay - cy, ax - cx);
  switch (kind) {
    case "segment":
      return (t) => [ax + (bx - ax) * t, ay + (by - ay) * t];
    case "upperArc":
      return (t) => [cx + half * Math.cos(start - Math.PI * t), cy + half * Math.sin(start - Math.PI * t)];
    case "lowerArc":
      return (t) => [cx + half * Math.cos(start + Math.PI * t), cy + half * Math.sin(start + Math.PI * t)];
    case "detour":
      return Object.assign(
        (t: number): Point => {
          const leg = Math.max(0, Math.min(2, Math.floor(t * 3)));
          const s = t * 3 - leg;
          if (leg === 0) {
            return [ax, ay + s];
          }
          if (leg === 1) {
            return [ax + (bx - ax) * s, ay + 1 + (by - ay) * s];
          }
          return [bx, by + 1 - s];
        },
        { corners: [1 / 3, 2 / 3] },
      );
  }
}

export function gateGeometry(center: Point, degrees: number, flipped: boolean, length = DEFAULT_GATE_LENGTH) {
  const theta = (degrees * Math.PI) / 180;
  const tx = Math.cos(theta);
  const ty = Math.sin(theta);
  const [x, y] = center;
  const half = length / 2;
  const sign = flipped ? -1 : 1;
  const ends: Edge = [
    [x - tx * half, y - ty * half],
    [x + tx * half, y + ty * half],
  ];
  const normal: Point = [-ty * sign, tx * sign];
  return { ends, normal };
}

/** ∫ F · n ds across the gate, with n the gate's chosen normal. */
export function gateFlux(field: Field, center: Point, degrees: number, flipped: boolean, length = DEFAULT_GATE_LENGTH) {
  const {
    ends: [[ax, ay], [bx, by]],
    normal: [nx, ny],
  } = gateGeometry(center, degrees, flipped, length);
  return (
    simpson(
      (t) => {
        const [p, q] = fieldVector(field, [ax + (bx - ax) * t, ay + (by - ay) * t]);
        return p * nx + q * ny;
      },
      0,
      1,
    ) * length
  );
}

export function squareEdges([x, y]: Point, size: number): Edge[] {
  const r = size / 2;
  const a: Point = [x - r, y - r];
  const b: Point = [x + r, y - r];
  const c: Point = [x + r, y + r];
  const d: Point = [x - r, y + r];
  return [
    [a, b],
    [b, c],
    [c, d],
    [d, a],
  ];
}

/** Work or outward flux along one straight edge, by Simpson's rule. */
function edgeContribution(field: Field, [[x, y], [a, b]]: Edge, flux = false): number {
  return lineIntegral(field, (t) => [x + (a - x) * t, y + (b - y) * t], 1, flux);
}

export function probeTotals(field: Field, edges: readonly Edge[]) {
  const flux = edges.map((edge) => edgeContribution(field, edge, true));
  const circulation = edges.map((edge) => edgeContribution(field, edge));
  return { flux, circulation, netFlux: sum(flux), netCirculation: sum(circulation) };
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function tiledRegion(divisions: number, lShape: boolean) {
  const size = 1 / divisions;
  const cells: Edge[][] = [];
  for (let row = 0; row < 2 * divisions; row++) {
    for (let column = 0; column < 2 * divisions; column++) {
      if (lShape && row >= divisions && column >= divisions) {
        continue;
      }
      // Integer grid coordinates give shared vertices stable, exact identities.
      cells.push(squareEdges([column + 0.5, row + 0.5], 1));
    }
  }
  const boundary = new Map<string, Edge>();
  const shared: Edge[] = [];
  for (const edge of cells.flat()) {
    const [a, b] = edge;
    const opposite = `${b}:${a}`;
    if (boundary.delete(opposite)) {
      shared.push(edge);
    } else {
      boundary.set(`${a}:${b}`, edge);
    }
  }
  const toWorld = ([a, b]: Edge): Edge => [
    [a[0] * size - 1, a[1] * size - 1],
    [b[0] * size - 1, b[1] * size - 1],
  ];
  return {
    area: cells.length * size ** 2,
    cells: cells.map((cell) => cell.map(toWorld)),
    boundary: [...boundary.values()].map(toWorld),
    shared: shared.map(toWorld),
  };
}

/** ∮ F · dr around a set of oriented edges (counterclockwise unless flipped). */
export function boundaryCirculation(edges: readonly Edge[], flipped: boolean, field: Field = "halfRotation"): number {
  return sum(edges.map((edge) => edgeContribution(field, edge))) * (flipped ? -1 : 1);
}

/** ∬ (∇ × F)z dA over the tiled region, by Gauss–Legendre on each cell. */
export function curlIntegral(field: Field, cells: readonly (readonly Edge[])[], flipped: boolean): number {
  const nodes = [-Math.sqrt(3 / 5), 0, Math.sqrt(3 / 5)];
  const weights = [5 / 9, 8 / 9, 5 / 9];
  let total = 0;
  for (const cell of cells) {
    const [[x0, y0], [x1]] = cell[0] ?? [
      [0, 0],
      [0, 0],
    ];
    const [, [, y1]] = cell[1] ?? [
      [0, 0],
      [0, 0],
    ];
    const [cx, cy, hx, hy] = [(x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2];
    nodes.forEach((u, i) => {
      nodes.forEach((v, j) => {
        total += (weights[i] ?? 0) * (weights[j] ?? 0) * curl(field, [cx + u * hx, cy + v * hy]) * hx * hy;
      });
    });
  }
  return total * (flipped ? -1 : 1);
}

/** The surfaces bounded by the unit rim on the Stokes screen, as heights over the unit disk. */
export const capShapes = ["paraboloid", "dome", "cone"] as const;
export type CapShape = (typeof capShapes)[number];

function capHeight(shape: CapShape, radius: number, height: number): number {
  const r = Math.min(1, radius);
  switch (shape) {
    case "paraboloid":
      return height * (1 - r * r);
    case "dome":
      return height * Math.sqrt(Math.max(0, 1 - r * r));
    case "cone":
      return height * (1 - r);
  }
}

/** d(height)/dr, for the surface normal. */
function capSlope(shape: CapShape, radius: number, height: number): number {
  const r = Math.min(1 - 1e-6, Math.max(1e-6, radius));
  switch (shape) {
    case "paraboloid":
      return -2 * height * r;
    case "dome":
      return (-height * r) / Math.sqrt(1 - r * r);
    case "cone":
      return -height;
  }
}

export function capPoint(radius: number, theta: number, height: number, shape: CapShape = "paraboloid"): Point3 {
  return [radius * Math.cos(theta), radius * Math.sin(theta), capHeight(shape, radius, height)];
}

export function capNormal([x, y]: Point3, height: number, flipped: boolean, shape: CapShape = "paraboloid"): Point3 {
  const sign = flipped ? -1 : 1;
  const r = Math.hypot(x, y);
  const slope = capSlope(shape, r, height);
  const [gx, gy] = r > 0 ? [(slope * x) / r, (slope * y) / r] : [0, 0];
  const length = Math.hypot(gx, gy, 1);
  return [(-sign * gx) / length, (-sign * gy) / length, sign / length];
}

/** The 3D field on the Stokes screen and its curl: F = (−y/2, x/2, 0), curl F = (0, 0, 1). */
export function stokesTotals(height: number, flipped: boolean, shape: CapShape = "paraboloid") {
  const sign = flipped ? -1 : 1;
  // On the unit rim F·r′ = 1/2, around a full turn.
  const rimCirculation = sign * 0.5 * 2 * Math.PI;
  // ∬ curl F · n dS over z = g(r): with curl F = k, the integrand reduces to the projected area
  // element, so the flux is the area of the unit disk whatever the shape. Integrate it anyway.
  const radialSteps = 64;
  let curlFlux = 0;
  for (let i = 0; i < radialSteps; i++) {
    const radius = (i + 0.5) / radialSteps;
    const normal = capNormal(capPoint(radius, 0, height, shape), height, flipped, shape);
    const slope = capSlope(shape, radius, height);
    const surfaceArea = ((2 * Math.PI * radius) / radialSteps) * Math.hypot(1, slope);
    curlFlux += normal[2] * surfaceArea;
  }
  return { rimCirculation, curlFlux };
}
