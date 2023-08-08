import { Controller } from "@flamework/core";
import { ContextActionService } from "@rbxts/services";
import { Inputs } from "client/types/input";

@Controller({})
export class Input {
	private inputs: Inputs = {};
	private getFormattedActionName(binderId: string, actionName: string) {
		return string.format("%s-%s", binderId, actionName);
	}

	public bindInput(binderId: string, actionName: string, actionUse: (inputState: boolean) => void, ...keycodes: [Enum.KeyCode | Enum.UserInputType]) {
		if (this.inputs[binderId] === undefined) this.inputs[binderId] = new Map<string, boolean>();

		const binder = this.inputs[binderId];
		const actionExists = binder.has(actionName);

		if (actionExists) throw `Action of name ${actionName} already exists on binder ${binderId}`;

		ContextActionService.BindAction(
			this.getFormattedActionName(binderId, actionName),
			(_, state: Enum.UserInputState) => {
				if (state === Enum.UserInputState.Begin) {
					if (binder.get(actionName) === true) return;
					binder.set(actionName, true);
					actionUse(true);
				} else if (state === Enum.UserInputState.End) {
					if (binder.get(actionName) === false) return;
					binder.set(actionName, false);
					actionUse(false);
				}
			},
			false,
			...keycodes,
		);

		binder.set(actionName, false);
	}
	public unbindInput(binderId: string, actionName: string): void {
		const binder = this.inputs[binderId];
		if (binder === undefined) throw `binder of ${binderId} doesn't exist on table input`;

		const actionExists = binder.has(actionName);
		if (!actionExists) warn(`binder of id ${binderId} doesn't have input name of ${actionName}`); //zaimplementuj w przyszlosci logger ktory tylko na studiu bedzie rzucal ostrzezenie

		ContextActionService.UnbindAction(this.getFormattedActionName(binderId, actionName));
		binder.delete(actionName);
	}

	public batchUnbindInput(binderId: string) {
		const binder = this.inputs[binderId];
		if (binder === undefined) throw `binder of ${binderId} doesn't exist on table input`;

		for (const [actionName] of pairs(binder)) {
			this.unbindInput(binderId, actionName as string);
		}
	}
}
