import { Controller } from "@flamework/core";
import { OnInputBegin, OnInputEnd } from "./core";
import { BindableActionKey, InputType, ActionTypes, BaseAction, ActionInvokeCallback } from "client/types/input";
import { UserInputService } from "@rbxts/services";
import { log } from "shared/log_message";
import localization from "client/localization/log/input";

@Controller({})
/**
 * Class responsile for processing user input
 * @author Krzymen
 * @class Input
 * @implements {OnInputBegin}
 * @implements {OnInputEnd}
 */
export class Input implements OnInputBegin, OnInputEnd {
	/**
	 * @static Maximum time between key presses to invoke action with `DoubleClick` type
	 */
	static doubleClickWindow = 0.2;
	/**
	 * @static How long key needs to be held to invoke action with `Hold` type
	 */
	static holdDuration = 2.5;

	static logType = localization.multipleBindsAtSamePriority[0];
	static logMessageTemplate = localization.multipleBindsAtSamePriority[1];

	private buttonsClickedCache: Map<Enum.KeyCode | Enum.UserInputType, number> = new Map<Enum.KeyCode | Enum.UserInputType, number>();
	private boundActions: ActionTypes[] = [];

	/**
	 * Check if key or mouse button is pressed
	 * @private
	 * @author Krzymen
	 * @param {Enum.KeyCode | Enum.MouseButton} key - key to check
	 * @returns {boolean} - true if key is pressed
	 */
	private isKeyDown(key: Enum.KeyCode | Enum.UserInputType): boolean {
		const mouseButtons = ["MouseButton1", "MouseButton2", "MouseButton3"];
		if (Enum.KeyCode.GetEnumItems().includes(key as Enum.KeyCode)) return UserInputService.IsKeyDown(key as Enum.KeyCode);
		if (mouseButtons.includes(key.Name)) return UserInputService.IsMouseButtonPressed(key as Enum.UserInputType);
		return false;
	}

	/**
	 * Checks if pressed modifier keys allows the action to run
	 * @private
	 * @author Krzymen
	 * @param {InputObject} inputObject - input object got from `UserInputService.InputBegan`
	 * @param {BaseAction} action - action to check if can run
	 * @returns {boolean} - true if action can run
	 */
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

	/**
	 * Gets actions with same keyCode, type and priority to given one
	 * @private
	 * @author Krzymen
	 * @param {InputObject} inputObject - input object got from `UserInputService.InputBegan`
	 * @param {BaseAction} action - action object used to compare metadata
	 * @returns {BaseAction[]} - array of actions with same metadata or empty array if no actions with same metadata exists
	 */
	private getActionsWithSameMetadata(inputObject: InputObject, action: BaseAction): BaseAction[] {
		return this.boundActions.filter(
			(foundAction) =>
				foundAction !== action &&
				foundAction.keyCode === action.keyCode &&
				foundAction.actionPriority === action.actionPriority &&
				foundAction.inputType === action.inputType &&
				this.areModifierKeysPressed(inputObject, foundAction),
		);
	}

	/**
	 * Sends a warning message to logger about duplicate actions
	 * @private
	 * @author Krzymen
	 * @param {BaseAction} sourceAction - first found action that meets the criteria
	 * @param {BaseAction} duplicateActions - array of duplicate actions with same metadata got from {@link Input.getActionsWithSameMetadata}
	 * @returns {void}
	 */
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

	/**
	 * Finds any actions with same metadata to given one using {@link Input.getActionsWithSameMetadata}
	 * If any are found then {@link Input.formatLog} gets invoked and all duplicate actions are passed to the appropriate handler
	 * @private
	 * @author Krzymen
	 * @param {BaseAction} sourceAction - found action that meets the criteria
	 * @param {InputObject} inputObject - input object got from `UserInputService.InputBegan`
	 * @param {number} clickedAt - tick at which button has been pressed
	 * @param {boolean} [hasDoubleClick = false] - whether there is an action with same keyCode with `DoubleClick` type
	 * @returns {void}
	 */
	private handleDuplicates(sourceAction: BaseAction, inputObject: InputObject, clickedAt: number, hasDoubleClick = false): void {
		const hasDuplicates = this.getActionsWithSameMetadata(inputObject, sourceAction);
		if (hasDuplicates.size() === 0) return;
		this.formatLog(sourceAction, hasDuplicates);
		hasDuplicates.forEach((action) => {
			if (sourceAction.inputType === "DoubleClick") return this.handleDoubleClickAction(action, clickedAt);
			if (sourceAction.inputType === "Hold") return this.handleHoldAction(action, clickedAt, Input.holdDuration);
			this.handleDefaultAction(action, hasDoubleClick, clickedAt);
		});
	}

	/**
	 * Handles given action with `Hold` type or `Default`/`Click` type if action action with same keyCode with `DoubleClick` type exists
	 * @private
	 * @author Krzymen
	 * @param {BaseAction} action - action to handle
	 * @param {number} clickedAt - tick at which button has been pressed
	 * @param {number} holdDuration - how long key needs to be held before invoking action callback
	 * @param {InputObject=} inputObject - input object got from `UserInputService.InputBegan`, when provided {@link Input.handleDuplicates} invokes
	 * @returns {void}
	 */
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

	/**
	 * Handles given action with `Default` or `Click` type
	 * @private
	 * @author Krzymen
	 * @param {BaseAction} action - action to handle
	 * @param {boolean} hasDoubleClickAction - whether there is an action with same keyCode with `DoubleClick` type
	 * @param {number} clickedAt - tick at which button has been pressed
	 * @param {InputObject=} inputObject - input object got from `UserInputService.InputBegan`, when provided {@link Input.handleDuplicates} invokes
	 * @returns {void}
	 */
	private handleDefaultAction(action: BaseAction, hasDoubleClickAction: boolean, clickedAt: number, inputObject?: InputObject): void {
		if (!hasDoubleClickAction && !action.isKeyDown) {
			if (action.inputType === "Default") action.isKeyDown = true;
			action.inputCallback(true);
		} else {
			this.handleHoldAction(action, clickedAt, Input.doubleClickWindow);
		}
		if (inputObject) this.handleDuplicates(action, inputObject, clickedAt, hasDoubleClickAction);
	}

	/**
	 * Handles given action with `DoubleClick` type
	 * @param {BaseAction} action - action to handle
	 * @param {number} clickedAt - tick at which button has been pressed
	 * @param {InputObject} inputObject - input object got from `UserInputService.InputBegan`, when provided {@link Input.handleDuplicates} invokes
	 * @returns {void}
	 */
	private handleDoubleClickAction(action: BaseAction, clickedAt: number, inputObject?: InputObject): void {
		if (!this.buttonsClickedCache.has(action.keyCode)) return;
		if (clickedAt - this.buttonsClickedCache.get(action.keyCode)! < Input.doubleClickWindow) {
			action.inputCallback(true);
		}
		if (inputObject) this.handleDuplicates(action, inputObject, clickedAt, false);
	}

	/**
	 * Bounds an action with given name, keyCode and priority
	 * @public
	 * @author Krzymen
	 * @param {string} actionName - unique name of the action
	 * @param {BindableActionKey} actionKey - key which needs to be pressed to invoke action
	 * @param {number} actionPriotity - priority of the action; On key press action with highest priority will invoke and other actions with the same type will be ignored
	 * @param {ActionInvokeCallback} callback - callback invoked when the action is invoked
	 * @return {void}
	 */
	public bindAction(actionName: string, actionKey: BindableActionKey, actionPriotity: number, callback: ActionInvokeCallback): void;
	/**
	 * Bounds an action with given name, keyCode, priority and modifierKeys
	 * @public
	 * @author Krzymen
	 * @param {string} actionName - unique name of the action
	 * @param {BindableActionKey} actionKey - key which needs to be pressed to invoke action
	 * @param {number} actionPriotity - priority of the action; On key press action with highest priority will invoke and other actions with the same type will be ignored
	 * @param {Enum.ModifierKey[]} requireModifierKeys - array of modifier keys which need to be pressed in order to invoke action
	 * @param {ActionInvokeCallback} callback - callback invoked when the action is invoked
	 * @return {void}
	 */
	public bindAction(
		actionName: string,
		actionKey: BindableActionKey,
		actionPriotity: number,
		requireModifierKeys: Enum.ModifierKey[],
		callback: ActionInvokeCallback,
	): void;
	/**
	 * Bounds an action with given name, keyCode, priority and type
	 * @public
	 * @author Krzymen
	 * @param {string} actionName - unique name of the action
	 * @param {BindableActionKey} actionKey - key which needs to be pressed to invoke action
	 * @param {number} actionPriotity - priority of the action; On key press action with highest priority will invoke and other actions with the same type will be ignored
	 * @param {InputType} actionInputType - type of input required to invoke action
	 * @param {ActionInvokeCallback} callback - callback invoked when the action is invoked
	 * @return {void}
	 */
	public bindAction(
		actionName: string,
		actionKey: BindableActionKey,
		actionPriotity: number,
		actionInputType: InputType,
		callback: ActionInvokeCallback,
	): void;
	/**
	 * Bounds an action with given name, keyCode, priority, type and modifierKeys
	 * @public
	 * @author Krzymen
	 * @param {string} actionName - unique name of the action
	 * @param {BindableActionKey} actionKey - key which needs to be pressed to invoke action
	 * @param {number} actionPriotity - priority of the action; On key press action with highest priority will invoke and other actions with the same type will be ignored
	 * @param {InputType} actionInputType - type of input required to invoke action
	 * @param {Enum.ModifierKey[]} requireModifierKeys - array of modifier keys which need to be pressed in order to invoke action
	 * @param {ActionInvokeCallback} callback - callback invoked when the action is invoked
	 * @return {void}
	 */
	public bindAction(
		actionName: string,
		actionKey: BindableActionKey,
		actionPriotity: number,
		actionInputType: InputType,
		requireModifierKeys: Enum.ModifierKey[],
		callback: ActionInvokeCallback,
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
		const callback: ActionInvokeCallback | undefined =
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
			inputCallback: (inputState: boolean) => task.spawn(() => callback(inputState)),
			modifierKeys: requireModifierKeys,
			inputType: actionInputType,
			keyCode: actionKey,
			isKeyDown: false,
		});

		this.boundActions = this.boundActions.sort((actionA, actionB) => actionA.actionPriority > actionB.actionPriority);
	}

	/**
	 * Unbinds an action with given actionName
	 * @public
	 * @author Krzymen
	 * @param {string} actionName - name of the action to unbind
	 * @returns {boolean} - whether the action was successfully unbound
	 */
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
