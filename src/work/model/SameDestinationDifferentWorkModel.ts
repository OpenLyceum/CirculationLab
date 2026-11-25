import { NumberProperty, StringUnionProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { type Field, fields, type PathKind, pathKinds } from "../../common/model/VectorMath.js";

/** Two paths from A to B, the straight one and a chosen one, in a chosen field. */
export class SameDestinationDifferentWorkModel implements TModel {
  public readonly fieldProperty = new StringUnionProperty<Field>("gradient", { validValues: fields });
  public readonly pathProperty = new StringUnionProperty<PathKind>("upperArc", { validValues: pathKinds });
  public readonly progressProperty = new NumberProperty(0, { range: new Range(0, 1) });
  public readonly startXProperty = new NumberProperty(-1, { range: new Range(-1.5, 1.5) });
  public readonly startYProperty = new NumberProperty(0, { range: new Range(-0.8, 0.6) });
  public readonly endXProperty = new NumberProperty(1, { range: new Range(-1.5, 1.5) });
  public readonly endYProperty = new NumberProperty(0, { range: new Range(-0.8, 0.6) });
  public readonly properties = [
    this.fieldProperty,
    this.pathProperty,
    this.progressProperty,
    this.startXProperty,
    this.startYProperty,
    this.endXProperty,
    this.endYProperty,
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
