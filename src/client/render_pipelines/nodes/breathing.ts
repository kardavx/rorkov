import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { offsetFromPivot } from "shared/utilities/cframe_utility";
import { Sine } from "shared/utilities/sine_utility";

export class Breathing implements Node {
	preUpdate(deltaTime: number, character: Model, equippedItem: EquippedItem): void {}

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		const offset = new Vector3();
		return offsetFromPivot(
			currentCFrame,
			equippedItem.item.CenterPart.CFrame,
			new CFrame(offset.Y, offset.X, offset.Z).mul(CFrame.Angles(offset.X, offset.Y, offset.Z)),
		);
	}
}
