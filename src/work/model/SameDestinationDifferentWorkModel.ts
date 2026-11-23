import { BooleanProperty, NumberProperty, StringUnionProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";

export class SameDestinationDifferentWorkModel implements TModel {
  public readonly fieldProperty = new StringUnionProperty<"gradient" | "halfRotation">("gradient", {
    validValues: ["gradient", "halfRotation"],
  });
  public readonly progressProperty = new NumberProperty(0, { range: new Range(0, 1) });
  public readonly reverseSegmentProperty = new BooleanProperty(false);
  public readonly reverseArcProperty = new BooleanProperty(false);
  public readonly properties = [
    this.fieldProperty,
    this.progressProperty,
    this.reverseSegmentProperty,
    this.reverseArcProperty,
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
