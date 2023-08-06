import { Controller, OnStart, OnRender } from "@flamework/core";
import { Players } from "@rbxts/services";
import { Input } from "./input";

interface ControlModule {
	Enable: (Enabled: boolean) => void;
}

@Controller({})
export class Movement implements OnStart, OnRender {
	static localPlayer = Players.LocalPlayer;
	static playerScripts = Movement.localPlayer.WaitForChild("PlayerScripts");
	static PlayerModule = Movement.playerScripts.WaitForChild("PlayerModule");
	static controlModule = require(Movement.PlayerModule.WaitForChild(
		"ControlModule",
	) as ModuleScript) as ControlModule;

	static inputMap = new Map<Enum.KeyCode, Vector3>([
		[Enum.KeyCode.W, new Vector3(0, 0, -1)],
		[Enum.KeyCode.A, new Vector3(0, 0, 1)],
		[Enum.KeyCode.S, new Vector3(-1, 0, 0)],
		[Enum.KeyCode.D, new Vector3(1, 0, 0)],
	]);

	private moveVector: Vector3 = Vector3.zero;
	constructor(private input: Input) {}

	onRender(dt: number): void {}
	onStart(): void {
		Movement.inputMap.forEach((keyCodeVector: Vector3, keyCode: Enum.KeyCode) => {
			this.input.bindInput(
				"movement",
				keyCode.Name,
				(inputState: boolean) => {
					inputState ? this.moveVector.add(keyCodeVector) : this.moveVector.sub(keyCodeVector);
				},
				keyCode,
			);
		});

		Movement.controlModule.Enable(false);
	}
}
