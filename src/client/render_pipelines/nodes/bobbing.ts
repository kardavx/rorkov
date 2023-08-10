import { Controller } from "@flamework/core";
import { Sine } from "shared/math_utility";
import { Node } from "../node";

@Controller({})
export class Bobbing implements Node {
	private sines = {
		X: new Sine(0.5, 5, 0),
		Z: new Sine(0.5, 5, 0),
	};

	private bobbingAmount: Vector3 = new Vector3();

	getSin(amplitude: number, frequency: number, phase: number) {
		return amplitude * math.sin(os.clock() * frequency + phase) * 0.1;
	}

	preUpdate(deltaTime: number, playerVelocity: number): void {
		this.bobbingAmount = new Vector3(this.sines.X.update(), 0, this.sines.Z.update());
	}

	update(deltaTime: number, currentCFrame: CFrame, playerVelocity: number): CFrame {
		return currentCFrame.add(this.bobbingAmount);
		//return currentCFrame.mul(CFrame.Angles(this.xSine.update(), this.ySine.update(), this.zSine.update()));
	}
}
