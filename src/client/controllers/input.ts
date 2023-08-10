import { Controller } from "@flamework/core";
import { OnInputBegin, OnInputEnd } from "./core";
import { BindableActionKey, InputType, ActionTypes, BaseAction } from "client/types/input";
import { UserInputService } from "@rbxts/services";

@Controller({})
export class Input implements OnInputBegin, OnInputEnd {
	static doubleClickWindow = 0.2;
	static holdDuration = 1;

	private buttonsClickedCache: Map<Enum.KeyCode | Enum.UserInputType, number> = new Map<Enum.KeyCode | Enum.UserInputType, number>();
	private boundActions: ActionTypes[] = [];

	private isKeyDown(key: Enum.KeyCode | Enum.UserInputType): boolean {
		const mouseButtons = ["MouseButton1", "MouseButton2", "MouseButton3"];
		return Enum.KeyCode.GetEnumItems().includes(key as Enum.KeyCode)
			? UserInputService.IsKeyDown(key as Enum.KeyCode)
			: mouseButtons.includes(key.Name)
			? UserInputService.IsMouseButtonPressed(key as Enum.UserInputType)
			: false;
	}

	private areModifierKeysPressed(inputObject: InputObject, keys: Enum.ModifierKey[]) {
		const modifierKeys = Enum.ModifierKey.GetEnumItems().filter((key) => inputObject.IsModifierKeyDown(key));
		return modifierKeys.find((key) => !keys.includes(key)) === undefined && keys.find((key) => !modifierKeys.includes(key)) === undefined;
	}

	private handleHoldAction(action: BaseAction, clickedAt: number, holdDuration: number = Input.holdDuration) {
		task.delay(holdDuration, () => {
			if (this.buttonsClickedCache.get(action.keyCode) === clickedAt) {
				const isButtonDown = this.isKeyDown(action.keyCode);
				if (isButtonDown && !action.isKeyDown) {
					if (action.inputType === "Default") action.isKeyDown = true;
					action.inputCallback(true);
				} else if (action.inputType === "Click") {
					action.inputCallback(true);
				}
			}
		});
	}

	private handleDefaultAction(action: BaseAction, hasDoubleClickAction: boolean, clickedAt: number) {
		if (!hasDoubleClickAction && !action.isKeyDown) {
			if (action.inputType === "Default") action.isKeyDown = true;
			action.inputCallback(true);
			return;
		}
		this.handleHoldAction(action, clickedAt, Input.doubleClickWindow);
	}

	private handleDoubleClickAction(action: BaseAction, clickedAt: number) {
		if (!this.buttonsClickedCache.has(action.keyCode)) return;
		if (clickedAt - this.buttonsClickedCache.get(action.keyCode)! < Input.doubleClickWindow) {
			action.inputCallback(true);
		}
	}

	public bindAction(actionName: string, actionKey: BindableActionKey, actionPriotity: number, callback: (inputState: boolean) => void): void;
	public bindAction(
		actionName: string,
		actionKey: BindableActionKey,
		actionPriotity: number,
		requireModifierKeys: Enum.ModifierKey[],
		callback: (inputState: boolean) => void,
	): void;
	public bindAction(
		actionName: string,
		actionKey: BindableActionKey,
		actionPriotity: number,
		actionInputType: InputType,
		callback: (inputState: boolean) => void,
	): void;
	public bindAction(
		actionName: string,
		actionKey: BindableActionKey,
		actionPriotity: number,
		actionInputType: InputType,
		requireModifierKeys: Enum.ModifierKey[],
		callback: (inputState: boolean) => void,
	): void;

	public bindAction(
		actionName: string,
		actionKey: BindableActionKey,
		actionPriority: number,
		fourthArgument: unknown,
		fifthArgument?: unknown,
		sixthArgument?: unknown,
	): void {
		const actionInputType: InputType = fourthArgument !== undefined && typeIs(fourthArgument, "string") ? (fourthArgument as InputType) : "Default";
		const requireModifierKeys: Enum.ModifierKey[] =
			fifthArgument !== undefined && typeIs(fifthArgument, "table")
				? (fifthArgument as Enum.ModifierKey[])
				: fourthArgument !== undefined && typeIs(fourthArgument, "table")
				? (fourthArgument as Enum.ModifierKey[])
				: [];
		const callback: ((inputState: boolean) => void) | undefined =
			sixthArgument !== undefined && typeIs(sixthArgument, "function")
				? sixthArgument
				: fifthArgument !== undefined && typeIs(fifthArgument, "function")
				? fifthArgument
				: fourthArgument !== undefined && typeIs(fourthArgument, "function")
				? fourthArgument
				: undefined;

		if (!callback) throw `No callback was provided for ${actionName}`;
		if (this.boundActions.find((bind) => bind.actionName === actionName)) throw `Action ${actionName} already exists!`;
		if (this.boundActions.find((bind) => bind.keyCode === actionKey && bind.inputType === actionInputType && bind.modifierKeys === requireModifierKeys))
			throw `Key ${actionKey} with type ${actionInputType} and ${requireModifierKeys} modifierKeys} already exists!`;

		this.boundActions.push({
			actionName,
			actionPriority,
			inputCallback: callback,
			modifierKeys: requireModifierKeys,
			inputType: actionInputType,
			keyCode: actionKey,
			isKeyDown: false,
		});

		this.boundActions = this.boundActions.sort((actionA, actionB) => actionA.actionPriority > actionB.actionPriority);
	}

	public unbindAction(actionName: string): boolean {
		const index = this.boundActions.findIndex((action) => action.actionName === actionName);
		if (index === -1) return false;
		return this.boundActions.remove(index) !== undefined;
	}

	onInputBegin(inputObject: InputObject): void {
		const key = inputObject.UserInputType === Enum.UserInputType.Keyboard ? inputObject.KeyCode : inputObject.UserInputType;

		const actionsBoundToKey = this.boundActions.filter((action) => action.keyCode === key);

		const actionTypes = new Map<string, ActionTypes | undefined>([
			[
				"defaultAction",
				actionsBoundToKey.find((action) => action.inputType === "Default" && this.areModifierKeysPressed(inputObject, action.modifierKeys)),
			],
			["clickAction", actionsBoundToKey.find((action) => action.inputType === "Click" && this.areModifierKeysPressed(inputObject, action.modifierKeys))],
			["holdAction", actionsBoundToKey.find((action) => action.inputType === "Hold" && this.areModifierKeysPressed(inputObject, action.modifierKeys))],
			[
				"doubleClickAction",
				actionsBoundToKey.find((action) => action.inputType === "DoubleClick" && this.areModifierKeysPressed(inputObject, action.modifierKeys)),
			],
		]);

		actionTypes.forEach((actionType, actionIndex) => {
			if (!actionType) actionTypes.delete(actionIndex);
		});
		if (actionTypes.size() === 0) return;

		const clickedAt = tick();
		const hasDoubleClick = actionTypes.has("doubleClickAction");
		if (actionTypes.has("defaultAction")) this.handleDefaultAction(actionTypes.get("defaultAction")!, hasDoubleClick, clickedAt);
		if (actionTypes.has("clickAction")) this.handleDefaultAction(actionTypes.get("clickAction")!, hasDoubleClick, clickedAt);
		if (hasDoubleClick) this.handleDoubleClickAction(actionTypes.get("doubleClickAction")!, clickedAt);
		if (actionTypes.has("holdAction")) this.handleHoldAction(actionTypes.get("holdAction")!, clickedAt);
		this.buttonsClickedCache.set(key, clickedAt);
	}

	onInputEnd(inputObject: InputObject): void {
		const key = inputObject.UserInputType === Enum.UserInputType.Keyboard ? inputObject.KeyCode : inputObject.UserInputType;
		this.boundActions
			.filter((action) => action.keyCode === key && action.isKeyDown && action.inputType === "Default")
			.forEach((action) => {
				action.isKeyDown = false;
				action.inputCallback(false);
			});
		task.delay(Input.doubleClickWindow, () => {
			if (!this.isKeyDown(key)) this.buttonsClickedCache.delete(key);
		});
	}
}
