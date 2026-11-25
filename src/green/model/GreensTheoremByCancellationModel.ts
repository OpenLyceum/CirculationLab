import { BooleanProperty, NumberProperty, StringUnionProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import type { Field } from "../../common/model/VectorMath.js";

/** Fields offered on the Green's theorem screen: each has curl somewhere, so circulation builds up. */
export const greenFields = [
  "halfRotation",
  "rotation",
  "shear",
  "mixed",
  "waves",
  "swirl",
] as const satisfies readonly Field[];

export class GreensTheoremByCancellationModel implements TModel {
  public readonly fieldProperty = new StringUnionProperty<(typeof greenFields)[number]>("halfRotation", {
    validValues: greenFields,
  });
  public readonly lShapeProperty = new BooleanProperty(false);
  public readonly divisionsProperty = new NumberProperty(2, { range: new Range(1, 4) });
  public readonly stageProperty = new NumberProperty(0, { range: new Range(0, 2) });
  public readonly flippedProperty = new BooleanProperty(false);
  public readonly properties = [
    this.fieldProperty,
    this.lShapeProperty,
    this.divisionsProperty,
    this.stageProperty,
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
