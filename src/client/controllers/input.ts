import { Controller, OnTick } from "@flamework/core";

type InputType = "Hold" | "Click" | "Double Click" | "Default";
type Inputs = {
	[keyCode in string]: {
		[actionName: string]: {
			inputType: InputType;
			inputState: boolean;
			inputClickTick: number | undefined;
		};
	};
};

@Controller({})
export class Input implements OnTick {
	private inputs: Inputs = {};

	onTick(dt: number): void {}
}
