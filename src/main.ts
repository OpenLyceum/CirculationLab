/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import CirculationLabColors from "./CirculationLabColors.js";
import { FluxThroughAGateScreen } from "./gate/FluxThroughAGateScreen.js";
import { GreensTheoremByCancellationScreen } from "./green/GreensTheoremByCancellationScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import { CirculationLabPreferencesModel } from "./preferences/CirculationLabPreferencesModel.js";
import { CirculationLabPreferencesNode } from "./preferences/CirculationLabPreferencesNode.js";
import { DivergenceVsCurlScreen } from "./probe/DivergenceVsCurlScreen.js";
import { OneRimTwoSurfacesScreen } from "./stokes/OneRimTwoSurfacesScreen.js";
import { SameDestinationDifferentWorkScreen } from "./work/SameDestinationDifferentWorkScreen.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  // Simulation-specific preferences; initial values come from circulationLabQueryParameters.
  const simPreferences = new CirculationLabPreferencesModel();

  const screens = [
    new SameDestinationDifferentWorkScreen({
      name: stringManager.getScreenNames().workStringProperty,
      tandem: Tandem.ROOT.createTandem("workScreen"),
      backgroundColorProperty: CirculationLabColors.backgroundColorProperty,
    }),
    new FluxThroughAGateScreen({
      name: stringManager.getScreenNames().gateStringProperty,
      tandem: Tandem.ROOT.createTandem("gateScreen"),
      backgroundColorProperty: CirculationLabColors.backgroundColorProperty,
    }),
    new DivergenceVsCurlScreen({
      name: stringManager.getScreenNames().probeStringProperty,
      tandem: Tandem.ROOT.createTandem("probeScreen"),
      backgroundColorProperty: CirculationLabColors.backgroundColorProperty,
    }),
    new GreensTheoremByCancellationScreen({
      name: stringManager.getScreenNames().greenStringProperty,
      tandem: Tandem.ROOT.createTandem("greenScreen"),
      backgroundColorProperty: CirculationLabColors.backgroundColorProperty,
    }),
    new OneRimTwoSurfacesScreen({
      name: stringManager.getScreenNames().stokesStringProperty,
      tandem: Tandem.ROOT.createTandem("stokesScreen"),
      backgroundColorProperty: CirculationLabColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) => new CirculationLabPreferencesNode(simPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Optional: fill in credits shown in Help → About
    credits: {
      leadDesign: "",
      softwareDevelopment: "",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});
