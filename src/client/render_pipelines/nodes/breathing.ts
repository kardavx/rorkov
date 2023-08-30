import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { offsetFromPivot } from "shared/utilities/cframe_utility";
import { Sine } from "shared/utilities/sine_utility";

type Sines = {
	[axis in string]: Sine;
};

export class Breathing extends Node {
	private offset = new CFrame();

	private sines: Sines = {
		pitch: new Sine(1, 3),
		yaw: new Sine(1, 1),
	};

	preUpdate(deltaTime: number, character: Model, equippedItem: EquippedItem): void {
		this.offset = CFrame.Angles(this.sines.pitch.update(), this.sines.yaw.update(), 0);
	}

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		return offsetFromPivot(currentCFrame, equippedItem.item.Grip.CFrame, this.offset);
	}
}
