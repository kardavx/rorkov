import { Controller } from "@flamework/core";
import { OnInputBegin, OnInputEnd } from "./core";
import { BindableActionKey, InputType, ActionTypes, BaseAction } from "client/types/input";
import { UserInputService } from "@rbxts/services";
import { log } from "shared/log_message";
import localization from "shared/localization/log/state";

@Controller({})
export class Input implements OnInputBegin, OnInputEnd {
	static doubleClickWindow = 0.2;
	static holdDuration = 2.5;
	static logType = localization.multipleBindsAtSamePriority[0];
	static logMessageTemplate = localization.multipleBindsAtSamePriority[1];

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

	private areModifierKeysPressed(inputObject: InputObject, action: BaseAction): boolean {
		if (action.modifierKeys.size() === 0) {
			const key = inputObject.UserInputType === Enum.UserInputType.Keyboard ? inputObject.KeyCode : inputObject.UserInputType;
			const keyHasModifierAction = this.boundActions.find(
				(action) => action.keyCode === key && action.actionPriority === action.actionPriority && action.modifierKeys.size() > 0,
			);
			if (!keyHasModifierAction) return true;
			return keyHasModifierAction.modifierKeys.find((modifierKey) => inputObject.IsModifierKeyDown(modifierKey)) === undefined;
		}
		const modifierKeys = Enum.ModifierKey.GetEnumItems().filter((key) => inputObject.IsModifierKeyDown(key));
		return (
			modifierKeys.find((key) => !action.modifierKeys.includes(key)) === undefined &&
			action.modifierKeys.find((key) => !modifierKeys.includes(key)) === undefined
		);
	}

	private getActionsWithSameMetadata(inputObject: InputObject, action: BaseAction) {
		return this.boundActions.filter(
			(foundAction) =>
				foundAction !== action &&
				foundAction.keyCode === action.keyCode &&
				foundAction.actionPriority === action.actionPriority &&
				foundAction.inputType === action.inputType &&
				this.areModifierKeysPressed(inputObject, foundAction),
		);
	}

	private formatLog(sourceAction: BaseAction, duplicateActions: BaseAction[]): void {
		log(
			Input.logType,
			string.format(
				Input.logMessageTemplate,
				sourceAction.keyCode.Name,
				sourceAction.modifierKeys.join(", "),
				sourceAction.inputType,
				[sourceAction.actionName, ...duplicateActions.map((action) => action.actionName)].join(", "),
			),
		);
	}

	private handleDuplicates(sourceAction: BaseAction, inputObject: InputObject, clickedAt: number, hasDoubleClick = false): void {
		const hasDuplicates = this.getActionsWithSameMetadata(inputObject, sourceAction);
		if (hasDuplicates.size() === 0) return;
		this.formatLog(sourceAction, hasDuplicates);
		const callback =
			sourceAction.inputType === "DoubleClick"
				? (action: BaseAction) => this.handleDoubleClickAction(action, clickedAt)
				: sourceAction.inputType === "Hold"
				? (action: BaseAction) => this.handleHoldAction(action, clickedAt, Input.holdDuration)
				: (action: BaseAction) => this.handleDefaultAction(action, hasDoubleClick, clickedAt);
		hasDuplicates.forEach((action) => callback(action));
	}

	private handleHoldAction(action: BaseAction, clickedAt: number, holdDuration: number, inputObject?: InputObject): void {
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
		if (inputObject) this.handleDuplicates(action, inputObject, clickedAt, false);
	}

	private handleDefaultAction(action: BaseAction, hasDoubleClickAction: boolean, clickedAt: number, inputObject?: InputObject): void {
		if (!hasDoubleClickAction && !action.isKeyDown) {
			if (action.inputType === "Default") action.isKeyDown = true;
			action.inputCallback(true);
		} else {
			this.handleHoldAction(action, clickedAt, Input.doubleClickWindow);
		}
		if (inputObject) this.handleDuplicates(action, inputObject, clickedAt, hasDoubleClickAction);
	}

	private handleDoubleClickAction(action: BaseAction, clickedAt: number, inputObject?: InputObject): void {
		if (!this.buttonsClickedCache.has(action.keyCode)) return;
		if (clickedAt - this.buttonsClickedCache.get(action.keyCode)! < Input.doubleClickWindow) {
			action.inputCallback(true);
		}
		if (inputObject) this.handleDuplicates(action, inputObject, clickedAt, false);
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
			["defaultAction", actionsBoundToKey.find((action) => action.inputType === "Default" && this.areModifierKeysPressed(inputObject, action))],
			["clickAction", actionsBoundToKey.find((action) => action.inputType === "Click" && this.areModifierKeysPressed(inputObject, action))],
			["holdAction", actionsBoundToKey.find((action) => action.inputType === "Hold" && this.areModifierKeysPressed(inputObject, action))],
			["doubleClickAction", actionsBoundToKey.find((action) => action.inputType === "DoubleClick" && this.areModifierKeysPressed(inputObject, action))],
		]);

		actionTypes.forEach((actionType, actionIndex) => {
			if (!actionType) actionTypes.delete(actionIndex);
		});
		if (actionTypes.size() === 0) return;

		const clickedAt = tick();
		const hasDoubleClick = actionTypes.has("doubleClickAction");

		if (actionTypes.has("defaultAction")) this.handleDefaultAction(actionTypes.get("defaultAction")!, hasDoubleClick, clickedAt, inputObject);
		if (actionTypes.has("clickAction")) this.handleDefaultAction(actionTypes.get("clickAction")!, hasDoubleClick, clickedAt, inputObject);
		if (hasDoubleClick) this.handleDoubleClickAction(actionTypes.get("doubleClickAction")!, clickedAt, inputObject);
		if (actionTypes.has("holdAction")) this.handleHoldAction(actionTypes.get("holdAction")!, clickedAt, Input.holdDuration, inputObject);
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
