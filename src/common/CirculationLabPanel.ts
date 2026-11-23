/**
 * CirculationLabPanel.ts
 *
 * A pre-themed Panel that automatically uses CirculationLabColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { CirculationLabPanel } from "../../common/CirculationLabPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new CirculationLabPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new CirculationLabPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new CirculationLabPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import CirculationLabColors from "../CirculationLabColors.js";
import { PANEL_CORNER_RADIUS } from "../CirculationLabConstants.js";

/** @public */
export type CirculationLabPanelOptions = PanelOptions;

/** Pre-themed Panel wrapper for control panels and info boxes. @public */
export class CirculationLabPanel extends Panel {
  public constructor(content: Node, providedOptions?: CirculationLabPanelOptions) {
    const options = optionize<CirculationLabPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: CirculationLabColors.panelBackgroundColorProperty,
        stroke: CirculationLabColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
