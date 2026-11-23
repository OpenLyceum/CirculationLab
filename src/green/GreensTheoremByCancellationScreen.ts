/**
 * GreensTheoremByCancellationScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createGreensTheoremByCancellationIcon() in src/common/CirculationLabScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import CirculationLabColors from "../CirculationLabColors.js";
import { createGreensTheoremByCancellationIcon } from "../common/CirculationLabScreenIcons.js";
import { GreensTheoremByCancellationModel } from "./model/GreensTheoremByCancellationModel.js";
import { GreensTheoremByCancellationKeyboardHelpContent } from "./view/GreensTheoremByCancellationKeyboardHelpContent.js";
import { GreensTheoremByCancellationScreenView } from "./view/GreensTheoremByCancellationScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type GreensTheoremByCancellationScreenOptions = ScreenOptions & { tandem: Tandem };

export class GreensTheoremByCancellationScreen extends Screen<
  GreensTheoremByCancellationModel,
  GreensTheoremByCancellationScreenView
> {
  public constructor(options: GreensTheoremByCancellationScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new GreensTheoremByCancellationModel(),
      // View factory — receives the model instance
      (model) =>
        new GreensTheoremByCancellationScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<GreensTheoremByCancellationScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: CirculationLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new GreensTheoremByCancellationKeyboardHelpContent(),
          homeScreenIcon: createGreensTheoremByCancellationIcon(),
          navigationBarIcon: createGreensTheoremByCancellationIcon(),
        },
        options,
      ),
    );
  }
}
