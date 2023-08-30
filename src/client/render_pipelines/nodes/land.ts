import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { offsetFromPivot } from "shared/utilities/cframe_utility";

export class Land extends Node {
	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		const offset = equippedItem.springs.Land.getOffset();
		return offsetFromPivot(
			currentCFrame,
			equippedItem.item.Grip.CFrame,
			new CFrame(0, offset.X * 3, 0).mul(CFrame.Angles(offset.X * 1.5, offset.Y, offset.Z)),
		);
	}
}
