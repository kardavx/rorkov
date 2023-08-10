import { Node } from "./node";

export interface PreUpdate {
	preUpdate(...args: unknown[]): void;
}

export interface Update {
	update(currentCFrame: CFrame, ...args: unknown[]): CFrame;
}

export class RenderPipelines implements PreUpdate, Update {
	private nodes: Node[] = [];
	constructor(nodes: typeof Node[]) {
		nodes.forEach((node: typeof Node) => {
			this.nodes.push(new node());
		});
	}

	preUpdate(...args: unknown[]): void {
		this.nodes.forEach((node: Node) => {
			node.preUpdate(...args);
		});
	}

	update(currentCFrame: CFrame, ...args: unknown[]): CFrame {
		let finalCFrame: CFrame = currentCFrame;

		this.nodes.forEach((node: Node) => {
			finalCFrame = finalCFrame.mul(node.update(finalCFrame, ...args));
		});

		return finalCFrame;
	}
}
