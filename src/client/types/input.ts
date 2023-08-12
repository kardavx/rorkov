export type InputType = "Default" | "DoubleClick" | "Hold" | "Click";
export type BindableActionKey = Enum.KeyCode | Enum.UserInputType.MouseButton1 | Enum.UserInputType.MouseButton2 | Enum.UserInputType.MouseButton3;

export type BaseAction = {
	inputType: InputType;
	keyCode: BindableActionKey;
	modifierKeys: Enum.ModifierKey[];
	actionName: string;
	actionPriority: number;
	isKeyDown: boolean;
	inputCallback: (inputState: boolean) => void;
};

export type ActionTypes = BaseAction;
