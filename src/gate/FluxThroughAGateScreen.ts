/**
 * FluxThroughAGateScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createFluxThroughAGateIcon() in src/common/CirculationLabScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import CirculationLabColors from "../CirculationLabColors.js";
import { createFluxThroughAGateIcon } from "../common/CirculationLabScreenIcons.js";
import { FluxThroughAGateModel } from "./model/FluxThroughAGateModel.js";
import { FluxThroughAGateKeyboardHelpContent } from "./view/FluxThroughAGateKeyboardHelpContent.js";
import { FluxThroughAGateScreenView } from "./view/FluxThroughAGateScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type FluxThroughAGateScreenOptions = ScreenOptions & { tandem: Tandem };

export class FluxThroughAGateScreen extends Screen<FluxThroughAGateModel, FluxThroughAGateScreenView> {
  public constructor(options: FluxThroughAGateScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new FluxThroughAGateModel(),
      // View factory — receives the model instance
      (model) =>
        new FluxThroughAGateScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<FluxThroughAGateScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: CirculationLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new FluxThroughAGateKeyboardHelpContent(),
          homeScreenIcon: createFluxThroughAGateIcon(),
          navigationBarIcon: createFluxThroughAGateIcon(),
        },
        options,
      ),
    );
  }
}
