import { BooleanProperty, NumberProperty, StringUnionProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { type Field, fields } from "../../common/model/VectorMath.js";

export class FluxThroughAGateModel implements TModel {
  public readonly fieldProperty = new StringUnionProperty<Field>("uniform", { validValues: fields });
  public readonly lengthProperty = new NumberProperty(1.4, { range: new Range(0.4, 2.4) });
  public readonly xProperty = new NumberProperty(0, { range: new Range(-1.5, 1.5) });
  public readonly yProperty = new NumberProperty(0, { range: new Range(-1.5, 1.5) });
  public readonly angleProperty = new NumberProperty(0, { range: new Range(0, 360) });
  public readonly flippedProperty = new BooleanProperty(false);
  public readonly properties = [
    this.fieldProperty,
    this.lengthProperty,
    this.xProperty,
    this.yProperty,
    this.angleProperty,
    this.flippedProperty,
  ] as const;

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
