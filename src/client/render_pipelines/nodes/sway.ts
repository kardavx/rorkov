import { Controller } from "@flamework/core";
import { Sine } from "shared/math_utility";
import { Node } from "../node";
import { UserInputService } from "@rbxts/services";
import { EquippedItem } from "client/types/items";

@Controller({})
export class Sway implements Node {
	// private frequency = 10;

	// private sines = {
	// 	X: new Sine(0.25, this.frequency, 0),
	// 	Y: new Sine(0.1, this.frequency, 0),
	// 	Z: new Sine(0.5, this.frequency, 0),
	// };

	// private sway: CFrame = new CFrame();
	// private lastCamCF: CFrame = new CFrame();

	preUpdate(deltaTime: number, playerVelocity: number, camCF: CFrame, equippedItem: EquippedItem): void {
		// const delta = UserInputService.GetMouseDelta();
		// this.sines.Z.setFrequency(this.frequency);
		// this.sines.Z.setAmplitude(delta.X * 10);
		// const offset = equippedItem.viewmodel.item.GetPivot().ToObjectSpace(equippedItem.viewmodel.GetPivot());
		// const bobZ = this.sines.Z.update();
		// this.sway = this.sway.Lerp(offset.mul(CFrame.Angles(0, math.rad(delta.X * 2), 0)), 10 * deltaTime);
		// this.lastCamCF = camCF;
	}

	update(deltaTime: number, currentCFrame: CFrame, playerVelocity: number, camCF: CFrame, equippedItem: EquippedItem): CFrame {
		// Apply the calculated bobbing amount to the player's position
		// return currentCFrame.mul(this.sway);
		return new CFrame();
	}
}
