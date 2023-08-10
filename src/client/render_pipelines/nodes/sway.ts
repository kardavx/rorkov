import { Springs } from "client/types/items";
import { Node } from "../node";

export class Sway implements Node {
	preUpdate(Springs: Springs): void {}
	update(currentCFrame: CFrame, ...args: unknown[]): CFrame {
		return new CFrame();
	}
}
