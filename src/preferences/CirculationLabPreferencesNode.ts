/**
 * CirculationLabPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Add controls here
 * when the sim gains sim-specific preferences. The empty shell still wraps content
 * in CirculationLabPanel so the shared panel toolkit stays reachable.
 */
import { Bounds2 } from "scenerystack/dot";
import { VBox } from "scenerystack/scenery";
import type { Tandem } from "scenerystack/tandem";
import CirculationLabNamespace from "../CirculationLabNamespace.js";
import { CirculationLabPanel } from "../common/CirculationLabPanel.js";
import type { CirculationLabPreferencesModel } from "./CirculationLabPreferencesModel.js";

export class CirculationLabPreferencesNode extends VBox {
  public constructor(_preferencesModel: CirculationLabPreferencesModel, _tandem?: Tandem) {
    // Pattern for a preference control (skill: scenerystack-preferences). The dialog is
    // always white, so use the controlSurface colors, not textColorProperty.
    //
    //   const prefStrings = StringManager.getInstance().getPreferences();
    //   const showGridCheckbox = new Checkbox(
    //     preferencesModel.showGridProperty,
    //     new Text(prefStrings.showGridStringProperty, {
    //       font: new PhetFont(14),
    //       fill: CirculationLabColors.controlSurfaceTextColorProperty,
    //     }),
    //     {
    //       // Shared slider / NumberControl / checkbox bundles live in CirculationLabControlOptions.ts:
    //       // copy the template's src/common/*ControlOptions.ts and apply the CirculationLab prefix.
    //       checkboxColor: CirculationLabColors.controlSurfaceTextColorProperty,
    //       checkboxColorBackground: CirculationLabColors.controlSurfaceColorProperty,
    //       ...(tandem && { tandem: tandem.createTandem("showGridCheckbox") }),
    //     },
    //   );
    //
    // Add showGridCheckbox to the content children below.
    const content = new VBox({
      align: "left",
      spacing: 12,
      children: [],
    });
    // The empty scaffold still needs finite bounds for the Preferences focus highlight.
    if (content.children.length === 0) {
      content.localBounds = new Bounds2(0, 0, 1, 1);
    }
    // Transparent / borderless so the Preferences dialog stays visually empty.
    const panel = new CirculationLabPanel(content, {
      fill: "transparent",
      stroke: null,
      xMargin: 0,
      yMargin: 0,
    });
    super({
      align: "left",
      spacing: 12,
      children: [panel],
    });
  }
}

CirculationLabNamespace.register("CirculationLabPreferencesNode", CirculationLabPreferencesNode);
