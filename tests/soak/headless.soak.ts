/**
 * By-hand headless soak: npm run test:soak:headless (never in CI).
 *
 * List the screens exactly as main.ts builds them. The harness in
 * tests/helpers/headlessSoak.ts (template-owned) presses every control, sets every slider,
 * steps, switches screens, flips the color profile and locale, presses Reset All, and
 * fails when listener counts, node counts or retained heap rise after every round.
 *
 * Add `actions` for what only this sim can do (record/clear, add/remove objects) and
 * `exclude` for controls that must not be pressed headless.
 */

import { StringProperty } from "scenerystack/axon";
import { Tandem } from "scenerystack/tandem";
import CirculationLabColors from "../../src/CirculationLabColors.js";
import { FluxThroughAGateScreen } from "../../src/gate/FluxThroughAGateScreen.js";
import { GreensTheoremByCancellationScreen } from "../../src/green/GreensTheoremByCancellationScreen.js";
import { DivergenceVsCurlScreen } from "../../src/probe/DivergenceVsCurlScreen.js";
import { OneRimTwoSurfacesScreen } from "../../src/stokes/OneRimTwoSurfacesScreen.js";
import { SameDestinationDifferentWorkScreen } from "../../src/work/SameDestinationDifferentWorkScreen.js";
import { describeHeadlessSoak } from "../helpers/headlessSoak.js";

describeHeadlessSoak({
  screens: () => [
    new SameDestinationDifferentWorkScreen({
      name: new StringProperty("Same Destination Different Work"),
      tandem: Tandem.OPT_OUT,
    }),
    new FluxThroughAGateScreen({ name: new StringProperty("Flux Through a Gate"), tandem: Tandem.OPT_OUT }),
    new DivergenceVsCurlScreen({ name: new StringProperty("Divergence vs. Curl"), tandem: Tandem.OPT_OUT }),
    new GreensTheoremByCancellationScreen({
      name: new StringProperty("Green’s Theorem by Cancellation"),
      tandem: Tandem.OPT_OUT,
    }),
    new OneRimTwoSurfacesScreen({ name: new StringProperty("One Rim Two Surfaces"), tandem: Tandem.OPT_OUT }),
  ],
  tracked: () => ({ CirculationLabColors }),
});
