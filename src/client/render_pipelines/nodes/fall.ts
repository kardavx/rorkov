import { Dependency } from "@flamework/core";
import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { offsetFromPivot } from "shared/utilities/cframe_utility";
import { Movement } from "client/controllers/movement";
import { lerp } from "shared/utilities/number_utility";

export class Fall extends Node {
	static maxPullUpAmount = 3;

	private movement = Dependency<Movement>();
	private pullUpAmount = 0;

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		if (this.movement.isFalling()) {
			this.pullUpAmount = lerp(this.pullUpAmount, Fall.maxPullUpAmount, 0.05);
		} else {
			this.pullUpAmount = lerp(this.pullUpAmount, 0, 0.2);
		}

		return offsetFromPivot(
			currentCFrame,
			equippedItem.item.Grip.CFrame,
			new CFrame(0, this.pullUpAmount / 2, 0).mul(CFrame.Angles(this.pullUpAmount, 0, 0)),
		);
	}
}
