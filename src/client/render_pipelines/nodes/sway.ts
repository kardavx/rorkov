import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { offsetFromPivot } from "shared/utilities/cframe_utility";
import { lerp, smoothStep } from "shared/utilities/number_utility";
import { Dependency } from "@flamework/core";
import { Camera } from "client/controllers/camera";

export class Sway extends Node {
	static maxSway = 0.2;

	private camera = Dependency<Camera>();

	private lastSwayAmount = new CFrame();
	private isNegative = (number: number): boolean => number < 0;
	private getSmoothenedSway = (number: number): number =>
		this.isNegative(number) ? lerp(-Sway.maxSway, 0, smoothStep(-Sway.maxSway, 0, number)) : lerp(0, Sway.maxSway, smoothStep(0, Sway.maxSway, number));

	preUpdate(deltaTime: number, character: Model, equippedItem: EquippedItem): void {
		const cameraDelta = this.camera.getRotationDelta();
		const y = cameraDelta.Y;
		const x = cameraDelta.X;

		task.spawn(() => {
			task.wait(0.03);
			equippedItem.springs.Sway.impulse(new Vector3(y / 130, -x / 105).mul(math.max(1, equippedItem.configuration.properties.weight as number)));
		});
	}

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		const offset = equippedItem.springs.Sway.getOffset();

		const x = this.getSmoothenedSway(offset.X);
		const y = this.getSmoothenedSway(offset.Y);

		const swayAmount = new CFrame(y * 2, x * 2, 0).mul(CFrame.Angles(0, -y / 2, y));

		this.lastSwayAmount = this.lastSwayAmount.Lerp(swayAmount, 5 * deltaTime);

		const swayCFrame = offsetFromPivot(currentCFrame, equippedItem.item.CenterPart.CFrame, this.lastSwayAmount);

		return swayCFrame;
	}
}
