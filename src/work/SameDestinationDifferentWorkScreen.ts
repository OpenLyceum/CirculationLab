/**
 * SameDestinationDifferentWorkScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createSameDestinationDifferentWorkIcon() in src/common/CirculationLabScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import CirculationLabColors from "../CirculationLabColors.js";
import { createSameDestinationDifferentWorkIcon } from "../common/CirculationLabScreenIcons.js";
import { SameDestinationDifferentWorkModel } from "./model/SameDestinationDifferentWorkModel.js";
import { SameDestinationDifferentWorkKeyboardHelpContent } from "./view/SameDestinationDifferentWorkKeyboardHelpContent.js";
import { SameDestinationDifferentWorkScreenView } from "./view/SameDestinationDifferentWorkScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type SameDestinationDifferentWorkScreenOptions = ScreenOptions & { tandem: Tandem };

export class SameDestinationDifferentWorkScreen extends Screen<
  SameDestinationDifferentWorkModel,
  SameDestinationDifferentWorkScreenView
> {
  public constructor(options: SameDestinationDifferentWorkScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new SameDestinationDifferentWorkModel(),
      // View factory — receives the model instance
      (model) =>
        new SameDestinationDifferentWorkScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<SameDestinationDifferentWorkScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: CirculationLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new SameDestinationDifferentWorkKeyboardHelpContent(),
          homeScreenIcon: createSameDestinationDifferentWorkIcon(),
          navigationBarIcon: createSameDestinationDifferentWorkIcon(),
        },
        options,
      ),
    );
  }
}
