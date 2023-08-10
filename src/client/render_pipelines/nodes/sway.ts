import { Springs } from "client/types/items";
import { SineWave } from "shared/math_utility";
import { Node } from "../node";

export class Sway implements Node {
	preUpdate(Springs: Springs): void {}
	update(currentCFrame: CFrame, ...args: unknown[]): CFrame {
		return new CFrame();
	}
}
