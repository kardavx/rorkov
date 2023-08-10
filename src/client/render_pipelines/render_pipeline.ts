import { Node } from "./node";

export interface PreUpdate {
	preUpdate(deltaTime: number, ...args: unknown[]): void;
}

export interface Update {
	update(deltaTime: number, currentCFrame: CFrame, ...args: unknown[]): CFrame;
}

export class RenderPipeline implements PreUpdate, Update {
	private nodes: Node[] = [];
	constructor(nodes: typeof Node[]) {
		nodes.forEach((node: typeof Node) => {
			this.nodes.push(new node());
		});
	}

	preUpdate(deltaTime: number, ...args: unknown[]): void {
		this.nodes.forEach((node: Node) => {
			node.preUpdate(deltaTime, ...args);
		});
	}

	update(deltaTime: number, currentCFrame: CFrame, ...args: unknown[]): CFrame {
		let finalCFrame: CFrame = currentCFrame;

		this.nodes.forEach((node: Node) => {
			finalCFrame = finalCFrame.mul(node.update(deltaTime, finalCFrame, ...args));
		});

		return finalCFrame;
	}
}
