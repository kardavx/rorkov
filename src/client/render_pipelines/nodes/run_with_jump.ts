import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { offsetFromPivot } from "shared/utilities/cframe_utility";

export class RunWithJump extends Node {
	private currentOffset = new CFrame();
	private maxOffset: CFrame | undefined;

	initialize(character: Model, equippedItem: EquippedItem): void {
		this.maxOffset = new CFrame(-1.6 + equippedItem.item.CenterPart.Size.Z / 6, -1, 0).mul(
			CFrame.Angles(-math.rad(10), math.rad((15 * equippedItem.item.CenterPart.Size.Z) / 3), 0),
		);
	}

	preUpdate(deltaTime: number, character: Model, equippedItem: EquippedItem): void {
		this.currentOffset = this.currentOffset.Lerp(equippedItem.runWithJumpOffset ? (this.maxOffset as CFrame) : new CFrame(), 10 * deltaTime);
	}

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		return offsetFromPivot(currentCFrame, equippedItem.item.Grip.CFrame, this.currentOffset);
	}
}
