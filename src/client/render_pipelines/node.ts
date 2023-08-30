import { Initialize, PreUpdate, Update, PostUpdate } from "./render_pipeline";

export class Node implements PreUpdate, Update, Initialize, PostUpdate {
	initialize(...args: unknown[]): void {}
	preUpdate(deltaTime: number, ...args: unknown[]): void {}
	update(deltaTime: number, currentCFrame: CFrame, ...args: unknown[]): CFrame {
		return currentCFrame;
	}
	postUpdate(deltaTime: number, ...args: unknown[]): void {}
}
