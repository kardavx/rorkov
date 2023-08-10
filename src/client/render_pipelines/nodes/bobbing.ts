import { Controller } from "@flamework/core";
import { Sine } from "shared/math_utility";
import { OnCharacterAdded } from "client/controllers/core";
import { Node } from "../node";

@Controller({})
export class Bobbing implements Node {
	private amplitude = 0.5;
	private frequency = 5;
	private phase = 0;

	private sines = [new Sine(1, 1, 0), new Sine(1, 1, 0)];

	private bobbingAmount: Vector3 = new Vector3();

	getSin(amplitude: number, frequency: number, phase: number) {
		return amplitude * math.sin(os.clock() * frequency + phase) * 0.1;
	}

	preUpdate(deltaTime: number, playerVelocity: number): void {
		this.sines.forEach((sine: Sine) => {
			sine.setAmplitude(this.amplitude);
			sine.setFrequency(this.frequency);
		});

		this.bobbingAmount = new Vector3(this.sines[0].update(), 0, this.sines[1].update());
	}

	update(deltaTime: number, currentCFrame: CFrame, playerVelocity: number): CFrame {
		return currentCFrame.add(this.bobbingAmount);
		//return currentCFrame.mul(CFrame.Angles(this.xSine.update(), this.ySine.update(), this.zSine.update()));
	}
}
