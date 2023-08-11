import { Controller } from "@flamework/core";
import { Sine } from "shared/math_utility";
import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { offsetFromPivot } from "shared/cframe_utility";

@Controller({})
export class Bobbing implements Node {
	static speed = 7;
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
		zOrientation: new Sine(0.5, Bobbing.speed),
		xOrientation: new Sine(0.2, Bobbing.speed * 2, 1.56),
		yOrientation: new Sine(0.05, Bobbing.speed * 2, 1.56),
		z: new Sine(0.6, Bobbing.speed * 2, 1.56),
		y: new Sine(0.6, Bobbing.speed * 2, 1.56),
		x: new Sine(0.2, Bobbing.speed * 2, 1.56),
	};

	private bobbingAmount: CFrame = new CFrame();

	preUpdate(deltaTime: number, playerVelocity: number, equippedItem: EquippedItem): void {
		// this.sines.X.setFrequency((playerVelocity * this.frequency) / 2);
		// this.sines.X.setAmplitude((this.amplitudes.X * playerVelocity) / 20);
		// this.sines.Y.setFrequency(playerVelocity * this.frequency * 2);
		// this.sines.Y.setAmplitude((this.amplitudes.Y * playerVelocity) / 20);
		// this.sines.Z.setFrequency(playerVelocity * this.frequency);
		// this.sines.Z.setAmplitude((this.amplitudes.Z * playerVelocity) / 20);

		// const bobX = this.sines.X.update();
		// const bobY = this.sines.Y.update();
		// const bobZ = this.sines.Z.update();

		// const x = this.sines.x.update();
		// const y = this.sines.y.update();
		// const z = this.sines.z.update();
		// const pitch = this.sines.pitch.update();
		// const yaw = this.sines.yaw.update();
		// const roll = this.sines.roll.update();

		const zOrientation = this.sines.zOrientation.update();
		const xOrientation = this.sines.xOrientation.update();
		const yOrientation = this.sines.yOrientation.update();
		const z = this.sines.z.update();
		const y = this.sines.y.update();
		const x = this.sines.x.update();

		this.bobbingAmount = this.bobbingAmount.Lerp(new CFrame(x, y, -z).mul(CFrame.Angles(-xOrientation, yOrientation, zOrientation)), 5 * deltaTime);
	}

	update(deltaTime: number, currentCFrame: CFrame, playerVelocity: number, equippedItem: EquippedItem): CFrame {
		return offsetFromPivot(currentCFrame, equippedItem.item.CenterPart.CFrame, this.bobbingAmount);
	}
}
