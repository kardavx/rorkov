import { PreUpdate, Update } from "./render_pipelines";

export class Node implements PreUpdate, Update {
	preUpdate(...args: unknown[]): void {}
	update(currentCFrame: CFrame, ...args: unknown[]): CFrame {
		return new CFrame();
	}
}
