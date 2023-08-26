import { Initialize, PreUpdate, Update } from "./render_pipeline";

export class Node implements PreUpdate, Update, Initialize {
	initialize(...args: unknown[]): void {}
	preUpdate(deltaTime: number, ...args: unknown[]): void {}
	update(deltaTime: number, currentCFrame: CFrame, ...args: unknown[]): CFrame {
		return currentCFrame;
	}
}
