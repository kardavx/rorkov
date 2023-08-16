import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { offsetFromPivot } from "shared/utilities/cframe_utility";

export class Jump implements Node {
	preUpdate(deltaTime: number, character: Model, equippedItem: EquippedItem): void {}

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		const offset = equippedItem.springs.Jump.getOffset();
		return offsetFromPivot(
			currentCFrame,
			equippedItem.item.CenterPart.CFrame,
			new CFrame(offset.Y, offset.X * 3, offset.Z).mul(CFrame.Angles(offset.X * 2, -offset.Y, offset.Z)),
		);
	}
}
