import { BooleanProperty, NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";

export class GreensTheoremByCancellationModel implements TModel {
  public readonly lShapeProperty = new BooleanProperty(false);
  public readonly divisionsProperty = new NumberProperty(2, { range: new Range(1, 4) });
  public readonly stageProperty = new NumberProperty(0, { range: new Range(0, 2) });
  public readonly flippedProperty = new BooleanProperty(false);
  public readonly properties = [
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
