import { BooleanProperty, NumberProperty, StringUnionProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { type Field, fields } from "../../common/model/VectorMath.js";

export class DivergenceVsCurlModel implements TModel {
  public readonly fieldProperty = new StringUnionProperty<Field>("source", { validValues: fields });
  public readonly xProperty = new NumberProperty(0.4, { range: new Range(-1.25, 1.25) });
  public readonly yProperty = new NumberProperty(0.3, { range: new Range(-1.25, 1.25) });
  public readonly sizeProperty = new NumberProperty(1, { range: new Range(0.1, 1.6) });
  public readonly circulationProperty = new BooleanProperty(false);
  public readonly properties = [
    this.fieldProperty,
    this.xProperty,
    this.yProperty,
    this.sizeProperty,
    this.circulationProperty,
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
