import { PreUpdate, Update } from "./render_pipeline";

export class Node implements PreUpdate, Update {
	preUpdate(...args: unknown[]): void;
	update(deltaTime: number, currentCFrame: CFrame, ...args: unknown[]): CFrame;
}
