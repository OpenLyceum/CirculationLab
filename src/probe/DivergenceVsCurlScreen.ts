/**
 * DivergenceVsCurlScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createDivergenceVsCurlIcon() in src/common/CirculationLabScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import CirculationLabColors from "../CirculationLabColors.js";
import { createDivergenceVsCurlIcon } from "../common/CirculationLabScreenIcons.js";
import { DivergenceVsCurlModel } from "./model/DivergenceVsCurlModel.js";
import { DivergenceVsCurlKeyboardHelpContent } from "./view/DivergenceVsCurlKeyboardHelpContent.js";
import { DivergenceVsCurlScreenView } from "./view/DivergenceVsCurlScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type DivergenceVsCurlScreenOptions = ScreenOptions & { tandem: Tandem };

export class DivergenceVsCurlScreen extends Screen<DivergenceVsCurlModel, DivergenceVsCurlScreenView> {
  public constructor(options: DivergenceVsCurlScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new DivergenceVsCurlModel(),
      // View factory — receives the model instance
      (model) =>
        new DivergenceVsCurlScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<DivergenceVsCurlScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: CirculationLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new DivergenceVsCurlKeyboardHelpContent(),
          homeScreenIcon: createDivergenceVsCurlIcon(),
          navigationBarIcon: createDivergenceVsCurlIcon(),
        },
        options,
      ),
    );
  }
}
