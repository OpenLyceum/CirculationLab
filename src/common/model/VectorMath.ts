export type Point = readonly [number, number];
export type Point3 = readonly [number, number, number];
export type Field = "uniform" | "source" | "rotation" | "halfRotation" | "shear" | "gradient";
export type Edge = readonly [Point, Point];
export type PathKind = "segment" | "semicircle";

export function fieldVector(field: Field, [x, y]: Point): Point {
  switch (field) {
    case "uniform":
      return [1, 0];
    case "source":
      return [x, y];
    case "rotation":
      return [-y, x];
    case "halfRotation":
      return [-y / 2, x / 2];
    case "shear":
      return [y, 0];
    case "gradient":
      return [1 + x, y];
  }
}

export function pathPoint(path: PathKind, t: number): Point {
  return path === "segment" ? [2 * t - 1, 0] : [-Math.cos(Math.PI * t), Math.sin(Math.PI * t)];
}

export function pathWork(field: "gradient" | "halfRotation", path: PathKind, progress: number, reverse: boolean) {
  const start = reverse ? 1 : 0;
  const end = reverse ? 1 - progress : progress;
  if (field === "gradient") {
    const potential = ([x, y]: Point) => x + (x * x + y * y) / 2;
    return potential(pathPoint(path, end)) - potential(pathPoint(path, start));
  }
  return path === "segment" ? 0 : (-Math.PI * (end - start)) / 2;
}

const GATE_LENGTH = 1.4;

export function gateGeometry(center: Point, degrees: number, flipped: boolean) {
  const theta = (degrees * Math.PI) / 180;
  const tx = Math.cos(theta);
  const ty = Math.sin(theta);
  const [x, y] = center;
  const half = GATE_LENGTH / 2;
  const sign = flipped ? -1 : 1;
  const ends: Edge = [
    [x - tx * half, y - ty * half],
    [x + tx * half, y + ty * half],
  ];
  const normal: Point = [-ty * sign, tx * sign];
  return { ends, normal };
}

// The midpoint rule is exact on a straight edge for every affine field in the lab.
export function edgeContribution(field: Field, [[x, y], [a, b]]: Edge, flux = false): number {
  const [p, q] = fieldVector(field, [(x + a) / 2, (y + b) / 2]);
  return flux ? p * (b - y) - q * (a - x) : p * (a - x) + q * (b - y);
}

export function gateFlux(field: "uniform" | "source", center: Point, degrees: number, flipped: boolean) {
  const {
    normal: [nx, ny],
  } = gateGeometry(center, degrees, flipped);
  const [p, q] = fieldVector(field, center);
  return (p * nx + q * ny) * GATE_LENGTH;
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

export function boundaryCirculation(edges: readonly Edge[], flipped: boolean): number {
  return sum(edges.map((edge) => edgeContribution("halfRotation", edge))) * (flipped ? -1 : 1);
}

export function capPoint(radius: number, theta: number, height: number): Point3 {
  return [radius * Math.cos(theta), radius * Math.sin(theta), height * (1 - radius ** 2)];
}

export function capNormal([x, y]: Point3, height: number, flipped: boolean): Point3 {
  const sign = flipped ? -1 : 1;
  const length = Math.hypot(2 * height * x, 2 * height * y, 1);
  return [(sign * 2 * height * x) / length, (sign * 2 * height * y) / length, sign / length];
}

export function stokesTotals(height: number, flipped: boolean) {
  const sign = flipped ? -1 : 1;
  // On the unit rim F·r′ = 1/2. Over the cap, curl F = (0, 0, 1)
  // and the oriented graph area vector has vertical component ±1.
  const rimCirculation = sign * 0.5 * 2 * Math.PI;
  const radialSteps = 32;
  let curlFlux = 0;
  for (let i = 0; i < radialSteps; i++) {
    const radius = (i + 0.5) / radialSteps;
    const normal = capNormal(capPoint(radius, 0, height), height, flipped);
    const surfaceArea = ((2 * Math.PI * radius) / radialSteps) * Math.hypot(1, 2 * height * radius);
    curlFlux += normal[2] * surfaceArea;
  }
  return { rimCirculation, curlFlux };
}
