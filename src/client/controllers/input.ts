import { Controller } from "@flamework/core";
import { ContextActionService } from "@rbxts/services";
import { Signal } from "@rbxts/beacon";

export type returnSignal = Signal<boolean>;
interface Inputs {
	[binderId: string]: {
		[actionName: string]: returnSignal;
	};
}

@Controller({})
export class Input {
	private inputs: Inputs = {};
	private getFormattedActionName(binderId: string, actionName: string) {
		return string.format("%s-%s", binderId, actionName);
	}

	public bindInput(
		binderId: string,
		actionName: string,
		...keycodes: [Enum.KeyCode | Enum.UserInputType]
	): returnSignal {
		if (this.inputs[binderId] === undefined) {
			this.inputs[binderId] = {};
		}

		const binderDirectory = this.inputs[binderId];
		if (binderDirectory[actionName] === undefined) {
			const signal = new Signal<boolean>();

			ContextActionService.BindAction(
				this.getFormattedActionName(binderId, actionName),
				(_, state: Enum.UserInputState) => {
					signal.Fire(state === Enum.UserInputState.Begin ? true : false);
				},
				false,
				...keycodes,
			);

			return signal;
		} else {
			return binderDirectory[actionName];
		}
	}

	public unbindInput(binderId: string, actionName: string): void {
		if (this.inputs[binderId] === undefined)
			throw string.format("binder of id %s doesn't exist on table inputs!", binderId);

		const signal = this.inputs[binderId][actionName];
		if (signal === undefined)
			warn(string.format("binder of id %s doesn't have input name of %s", binderId, actionName)); //zaimplementuj w przyszlosci logger ktory tylko na studiu bedzie rzucal ostrzezenie

		signal.Destroy();
		ContextActionService.UnbindAction(this.getFormattedActionName(binderId, actionName));
	}

	public batchUnbindInput(binderId: string) {
		if (this.inputs[binderId] === undefined)
			throw string.format("binder of id %s doesn't exist on table inputs!", binderId);

		for (const [actionName] of pairs(this.inputs[binderId])) {
			this.unbindInput(binderId, actionName as string);
		}
	}
}
