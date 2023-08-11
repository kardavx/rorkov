import { Controller } from "@flamework/core";
import { Sine } from "shared/utilities/sine_utility";
import { Node } from "../node";
import { EquippedItem } from "client/types/items";

@Controller({})
export class Bobbing implements Node {
	private frequency = 0.5;
	// private amplitudes = {
	// 	X: 0.25,
	// 	Y: 0.1,
	// 	Z: 1,
	// };

	// private sines = {
	// 	X: new Sine(this.amplitudes.X, this.frequency, 0),
	// 	Y: new Sine(this.amplitudes.Y, this.frequency, 0),
	// 	Z: new Sine(this.amplitudes.Z, this.frequency, 0),
	// };

	private sines = {
		x: new Sine(0, 2, 0.2),
		y: new Sine(0.015, 3, 0.3),
		z: new Sine(0.05, 2, 0.1),
		pitch: new Sine(0.1, 2, 0.25),
		yaw: new Sine(0.015, 1, 0.5),
		roll: new Sine(0.5, 1.5, 0.8),
	};

	private bobbingAmount: CFrame = new CFrame();

	preUpdate(deltaTime: number, playerVelocity: number, camCF: CFrame, equippedItem: EquippedItem): void {
		// this.sines.X.setFrequency((playerVelocity * this.frequency) / 2);
		// this.sines.X.setAmplitude((this.amplitudes.X * playerVelocity) / 20);
		// this.sines.Y.setFrequency(playerVelocity * this.frequency * 2);
		// this.sines.Y.setAmplitude((this.amplitudes.Y * playerVelocity) / 20);
		// this.sines.Z.setFrequency(playerVelocity * this.frequency);
		// this.sines.Z.setAmplitude((this.amplitudes.Z * playerVelocity) / 20);

		// const bobX = this.sines.X.update();
		// const bobY = this.sines.Y.update();
		// const bobZ = this.sines.Z.update();

		const x = this.sines.x.update();
		const y = this.sines.y.update();
		const z = this.sines.z.update();
		const pitch = this.sines.pitch.update();
		const yaw = this.sines.yaw.update();
		const roll = this.sines.roll.update();

		this.bobbingAmount = this.bobbingAmount.Lerp(new CFrame(x, y, z).mul(CFrame.Angles(pitch, yaw, roll)), 5 * deltaTime);
	}

	update(deltaTime: number, currentCFrame: CFrame, playerVelocity: number, camCF: CFrame, equippedItem: EquippedItem): CFrame {
		return currentCFrame.mul(this.bobbingAmount);
	}
}
