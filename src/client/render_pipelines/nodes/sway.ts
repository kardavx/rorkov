import { Controller } from "@flamework/core";
import { Sine } from "shared/math_utility";
import { Node } from "../node";
import { UserInputService } from "@rbxts/services";

@Controller({})
export class Sway implements Node {
	private frequency = 10;

	private sines = {
		X: new Sine(0.25, this.frequency, 0),
		Y: new Sine(0.1, this.frequency, 0),
		Z: new Sine(0.5, this.frequency, 0),
	};

	private sway: CFrame = new CFrame();
	private lastCamCF: CFrame = new CFrame();

	preUpdate(deltaTime: number, playerVelocity: number, camCF: CFrame): void {
		const delta = UserInputService.GetMouseDelta();

		this.sines.Z.setFrequency(this.frequency);
		this.sines.Z.setAmplitude(delta.X * 10);

		print(delta.X * 100);

		const bobZ = this.sines.Z.update();

		this.sway = this.sway.Lerp(CFrame.Angles(0, math.rad(delta.X * 2), 0), 10 * deltaTime);

		this.lastCamCF = camCF;
	}

	update(deltaTime: number, currentCFrame: CFrame, playerVelocity: number, camCF: CFrame): CFrame {
		// Apply the calculated bobbing amount to the player's position
		return currentCFrame.mul(this.sway);
	}
}
