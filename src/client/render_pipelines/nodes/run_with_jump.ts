import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { offsetFromPivot } from "shared/utilities/cframe_utility";

export class RunWithJump extends Node {
	static maxOffset = CFrame.Angles(0.5, 0.2, 0);
	private currentOffset = new CFrame();

	preUpdate(deltaTime: number, character: Model, equippedItem: EquippedItem): void {
		this.currentOffset = this.currentOffset.Lerp(equippedItem.runWithJumpOffset ? RunWithJump.maxOffset : new CFrame(), 10 * deltaTime);
	}

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		return offsetFromPivot(currentCFrame, equippedItem.item.Grip.CFrame, this.currentOffset);
	}
}
