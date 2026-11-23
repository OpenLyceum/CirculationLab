/**
 * OneRimTwoSurfacesScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createOneRimTwoSurfacesIcon() in src/common/CirculationLabScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import CirculationLabColors from "../CirculationLabColors.js";
import { createOneRimTwoSurfacesIcon } from "../common/CirculationLabScreenIcons.js";
import { OneRimTwoSurfacesModel } from "./model/OneRimTwoSurfacesModel.js";
import { OneRimTwoSurfacesKeyboardHelpContent } from "./view/OneRimTwoSurfacesKeyboardHelpContent.js";
import { OneRimTwoSurfacesScreenView } from "./view/OneRimTwoSurfacesScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type OneRimTwoSurfacesScreenOptions = ScreenOptions & { tandem: Tandem };

export class OneRimTwoSurfacesScreen extends Screen<OneRimTwoSurfacesModel, OneRimTwoSurfacesScreenView> {
  public constructor(options: OneRimTwoSurfacesScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new OneRimTwoSurfacesModel(),
      // View factory — receives the model instance
      (model) =>
        new OneRimTwoSurfacesScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<OneRimTwoSurfacesScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: CirculationLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new OneRimTwoSurfacesKeyboardHelpContent(),
          homeScreenIcon: createOneRimTwoSurfacesIcon(),
          navigationBarIcon: createOneRimTwoSurfacesIcon(),
        },
        options,
      ),
    );
  }
}
