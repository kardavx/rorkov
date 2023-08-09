import { Controller, OnStart, OnInit } from "@flamework/core";

interface Modifiers {
	[modifierName: string]: Modifier | undefined;
}

export class Modifier {
	static modifiers: Modifiers = {};
	static dampenAmount = 5;

	private targetOffset: CFrame = new CFrame();
	private currentOffset: CFrame = this.targetOffset;
	private destroyed = false;

	private constructor(private name: string, private isAutomaticallyDampened: boolean) {}

	public getOffset = (): CFrame => {
		if (this.destroyed) throw `Attempt to get offset of modifier after it was destroyed`;

		return this.currentOffset;
	};

	public setOffset = (newOffset: CFrame) => {
		if (this.destroyed) throw `Attempt to set offset of modifier after it was destroyed`;

		this.currentOffset = newOffset;
		this.targetOffset = newOffset;
	};

	public update = (deltaTime: number) => {
		if (this.destroyed) throw `Attempt to update modifier after it was destroyed`;

		if (this.isAutomaticallyDampened) {
			this.currentOffset.Lerp(new CFrame(), Modifier.dampenAmount * deltaTime);
		}

		this.currentOffset.Lerp(this.targetOffset, Modifier.dampenAmount * deltaTime);
	};

	public destroy = (): void => {
		this.destroyed = true;
		Modifier.modifiers[this.name] = undefined;
	};
}

@Controller({})
export class Camera implements OnStart, OnInit {
	onInit() {}

	onStart() {}
}
