/**
 * CirculationLabPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Keep this empty shell until the sim needs real preferences; the
 * empty until the sim needs a preference.
 */
import CirculationLabNamespace from "../CirculationLabNamespace.js";
import "./circulationLabQueryParameters.js";

export class CirculationLabPreferencesModel {
  // Pattern for a preference (skill: scenerystack-preferences). Every preference is
  // one chain: query parameter → Property here → label in every strings_*.json →
  // control in CirculationLabPreferencesNode → reset() below.
  //
  //   import { BooleanProperty } from "scenerystack/axon";
  //   import circulationLabQueryParameters from "./circulationLabQueryParameters.js"; // replaces the bare import
  //
  //   public readonly showGridProperty: BooleanProperty;
  //
  //   // in the constructor (rename _tandem → tandem):
  //   this.showGridProperty = new BooleanProperty(
  //     circulationLabQueryParameters.showGrid,
  //     tandem ? { tandem: tandem.createTandem("showGridProperty") } : undefined,
  //   );
  //
  //   // in reset():
  //   this.showGridProperty.reset();

  public reset(): void {
    // No sim-specific preferences yet.
  }
}

CirculationLabNamespace.register("CirculationLabPreferencesModel", CirculationLabPreferencesModel);
