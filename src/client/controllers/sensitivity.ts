import { Controller, OnTick } from "@flamework/core";
import { UserInputService } from "@rbxts/services";

const userSettings = UserSettings().GetService("UserGameSettings");

type Modifiers = { [modifierName in string]: Modifier | undefined };

export class Modifier {
	static modifiers: Modifiers = {};

	static create = (name: string): Modifier => {
		if (!Modifier.modifiers[name]) Modifier.modifiers[name] = new Modifier(name);
		return Modifier.modifiers[name] as Modifier;
	};

	static getSummedOffsets = (): number => {
		let finalOffset = 1;

		for (const [_, modifierObject] of pairs(Modifier.modifiers)) {
			finalOffset = finalOffset + modifierObject.getOffset();
		}

		return finalOffset;
	};

	private divider = 0;
	private destroyed = false;

	private constructor(private name: string) {}

	public getOffset = (): number => {
		if (this.destroyed) throw `Attempt to get offset of modifier after it was destroyed`;

		return this.divider;
	};

	public setOffset = (newDivider: number) => {
		if (this.destroyed) throw `Attempt to set offset of modifier after it was destroyed`;

		this.divider = newDivider;
	};

	public reset = () => {
		this.setOffset(0);
	};

	public destroy = (): void => {
		this.reset();
		Modifier.modifiers[this.name] = undefined;
		this.destroyed = true;
	};
}

@Controller({})
export class Sensitivity implements OnTick {
	onTick(dt: number): void {
		UserInputService.MouseDeltaSensitivity = userSettings.MouseSensitivity / Modifier.getSummedOffsets();
	}
}
