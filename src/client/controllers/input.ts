import { Controller } from "@flamework/core";
import { ContextActionService } from "@rbxts/services";

interface Inputs {
	[binderId: string]: string[];
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
		actionUse: (inputState: boolean) => void,
		...keycodes: [Enum.KeyCode | Enum.UserInputType]
	) {
		if (this.inputs[binderId] === undefined) this.inputs[binderId] = [];

		const binder = this.inputs[binderId];
		const actionExists = binder.find((value: string) => value === actionName) !== undefined;

		if (actionExists) throw `Action of name ${actionName} already exists on binder ${binderId}`;

		ContextActionService.BindAction(
			this.getFormattedActionName(binderId, actionName),
			(_, state: Enum.UserInputState) => {
				actionUse(state === Enum.UserInputState.Begin);
			},
			false,
			...keycodes,
		);

		binder.push(actionName);
	}

	public unbindInput(binderId: string, actionName: string): void {
		const binder = this.inputs[binderId];
		if (binder === undefined) throw `binder of ${binderId} doesn't exist on table input`;

		const actionExists = binder.find((value: string) => value === actionName) !== undefined;
		if (!actionExists) warn(`binder of id ${binderId} doesn't have input name of ${actionName}`); //zaimplementuj w przyszlosci logger ktory tylko na studiu bedzie rzucal ostrzezenie

		ContextActionService.UnbindAction(this.getFormattedActionName(binderId, actionName));
		binder.remove(binder.indexOf(actionName));
	}

	public batchUnbindInput(binderId: string) {
		const binder = this.inputs[binderId];
		if (binder === undefined) throw `binder of ${binderId} doesn't exist on table input`;

		binder.forEach((actionName: string) => {
			this.unbindInput(binderId, actionName as string);
		});
	}
}
