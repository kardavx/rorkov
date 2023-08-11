import { Controller } from "@flamework/core";
import { Sine } from "shared/math_utility";
import { Node } from "../node";

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
		zOrientation: new Sine(1.3, 1, 0),
		y: new Sine(1.2, 2, 0),
		x: new Sine(1.3, 1, 0),
		z: new Sine(1.4, 2, 0),
	};

	private bobbingAmount: CFrame = new CFrame();

	preUpdate(deltaTime: number, playerVelocity: number): void {
		// this.sines.X.setFrequency((playerVelocity * this.frequency) / 2);
		// this.sines.X.setAmplitude((this.amplitudes.X * playerVelocity) / 20);
		// this.sines.Y.setFrequency(playerVelocity * this.frequency * 2);
		// this.sines.Y.setAmplitude((this.amplitudes.Y * playerVelocity) / 20);
		// this.sines.Z.setFrequency(playerVelocity * this.frequency);
		// this.sines.Z.setAmplitude((this.amplitudes.Z * playerVelocity) / 20);

		// const bobX = this.sines.X.update();
		// const bobY = this.sines.Y.update();
		// const bobZ = this.sines.Z.update();

		const zOrientation = this.sines.zOrientation.update();
		const y = this.sines.y.update();
		const x = this.sines.x.update();
		const z = this.sines.z.update();

		this.bobbingAmount = this.bobbingAmount.Lerp(new CFrame(x, y, z).mul(CFrame.Angles(0, 0, zOrientation)), 5 * deltaTime);
	}

	update(deltaTime: number, currentCFrame: CFrame, playerVelocity: number): CFrame {
		// Apply the calculated bobbing amount to the player's position
		return currentCFrame.mul(this.bobbingAmount);
	}
}
