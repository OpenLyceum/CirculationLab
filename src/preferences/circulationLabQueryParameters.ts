/**
 * circulationLabQueryParameters.ts
 *
 * Sim-specific startup query parameters. Declare each public parameter here and
 * initialize matching preference Properties from them when needed.
 *
 * Side-effect module while empty: imported from the preferences model so Knip
 * keeps the file without an unused default export.
 */
import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import CirculationLabNamespace from "../CirculationLabNamespace.js";

const circulationLabQueryParameters = QueryStringMachine.getAll({
  // Pattern (skill: scenerystack-query-parameters): one typed entry per parameter.
  // Mark it public only if users may set it from the URL. When the first entry is
  // added, make circulationLabQueryParameters the module's default export and import it by
  // name from CirculationLabPreferencesModel.
  //
  //   showGrid: { type: "boolean", defaultValue: false, public: true },
});

CirculationLabNamespace.register("circulationLabQueryParameters", circulationLabQueryParameters);

logGlobal("phet.chipper.queryParameters");
