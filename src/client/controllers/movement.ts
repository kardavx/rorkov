import { Controller, OnStart, OnRender } from "@flamework/core";
import { Players } from "@rbxts/services";
import { RunService } from "@rbxts/services";
import { UserInputService } from "@rbxts/services";

interface ControlModule {
	Enable: (Enabled: boolean) => void;
}

const localPlayer = Players.LocalPlayer;

const playerScripts = localPlayer.WaitForChild("PlayerScripts");
const PlayerModule = playerScripts.WaitForChild("PlayerModule");
const controlModule = require(PlayerModule.WaitForChild("ControlModule") as ModuleScript) as ControlModule;

const inputMap = new Map<Enum.KeyCode, Vector3>([
	[Enum.KeyCode.W, new Vector3(0, 0, -1)],
	[Enum.KeyCode.A, new Vector3(0, 0, 1)],
	[Enum.KeyCode.S, new Vector3(-1, 0, 0)],
	[Enum.KeyCode.D, new Vector3(1, 0, 0)],
]);

@Controller({})
export class Movement implements OnStart, OnRender {
	getInput() {
		const newInput = Vector3.zero;

		inputMap.forEach((vector3, keyCode) => {
			if (!UserInputService.IsKeyDown(keyCode)) {
				return;
			}

			newInput.add(vector3);
		});
	}

	onRender(dt: number): void {}
	onStart(): void {
		controlModule.Enable(false);
	}
}
