/**
 * Memory-leak regression suite (fleet standard).
 *
 * List every model/view object that links Properties, adds listeners, or owns child
 * nodes, with a factory that builds a fresh instance. The shared harness in
 * tests/helpers/memoryLeak.ts (template-owned) checks that each one is garbage
 * collected after dispose() and leaves no survivors across repeated cycles
 * (idempotentDispose: true also checks a second dispose()). Add sim-specific leak
 * tests below using forceGC().
 */

import { FluxThroughAGateModel } from "../src/gate/model/FluxThroughAGateModel.js";
import { GreensTheoremByCancellationModel } from "../src/green/model/GreensTheoremByCancellationModel.js";
import { DivergenceVsCurlModel } from "../src/probe/model/DivergenceVsCurlModel.js";
import { OneRimTwoSurfacesModel } from "../src/stokes/model/OneRimTwoSurfacesModel.js";
import { SameDestinationDifferentWorkModel } from "../src/work/model/SameDestinationDifferentWorkModel.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  { name: "SameDestinationDifferentWorkModel", create: () => new SameDestinationDifferentWorkModel() },
  { name: "FluxThroughAGateModel", create: () => new FluxThroughAGateModel() },
  { name: "DivergenceVsCurlModel", create: () => new DivergenceVsCurlModel() },
  { name: "GreensTheoremByCancellationModel", create: () => new GreensTheoremByCancellationModel() },
  { name: "OneRimTwoSurfacesModel", create: () => new OneRimTwoSurfacesModel() },
]);
