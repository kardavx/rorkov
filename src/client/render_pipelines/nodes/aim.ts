import { TweenService } from "@rbxts/services";
import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { offsetFromPivot } from "shared/utilities/cframe_utility";
import { lerp } from "shared/utilities/number_utility";

export class Breathing implements Node {
	private aimFactor = 0;

	initialize(character: Model, equippedItem: EquippedItem): void {}

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
