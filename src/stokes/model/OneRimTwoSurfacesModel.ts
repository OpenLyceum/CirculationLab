import { BooleanProperty, NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";

export class OneRimTwoSurfacesModel implements TModel {
  public readonly heightProperty = new NumberProperty(0.7, { range: new Range(0, 1.5) });
  public readonly rotationProperty = new NumberProperty(-25, { range: new Range(-75, 40) });
  public readonly flippedProperty = new BooleanProperty(false);
  public readonly properties = [this.heightProperty, this.rotationProperty, this.flippedProperty] as const;

  public reset(): void {
    for (const property of this.properties) {
      property.reset();
    }
  }

  public dispose(): void {
    for (const property of this.properties) {
      property.dispose();
    }
  }
}
