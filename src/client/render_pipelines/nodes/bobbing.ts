import { Sine } from "shared/math_utility";
import { Node } from "../node";

export class Bobbing implements Node {
	private xSine = new Sine(1, 1, 0);
	private ySine = new Sine(1, 1, 0);
	private zSine = new Sine(1, 1, 0);

	preUpdate(deltaTime: number, playerVelocity: number): void {}
	update(deltaTime: number, currentCFrame: CFrame, playerVelocity: number): CFrame {
		return currentCFrame.mul(CFrame.Angles(this.xSine.update(), this.ySine.update(), this.zSine.update()));
	}
}
