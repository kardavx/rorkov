import { Controller, Modding, OnInit } from "@flamework/core";
import { Players, UserInputService } from "@rbxts/services";
import { RunService } from "@rbxts/services";

export interface OnCharacterAdded {
	onCharacterAdded(character: Model): void;
}

export interface OnPostCameraRender {
	onPostCameraRender(deltaTime: number): void;
}

export interface OnCameraRender {
	onCameraRender(deltaTime: number): void;
}

export interface OnPreCameraRender {
	onPreCameraRender(deltaTime: number): void;
}

export interface OnInputBegin {
	onInputBegin(inputObject: InputObject): void;
}

export interface OnInputEnd {
	onInputEnd(inputObject: InputObject): void;
}

@Controller({})
export class CharacterAdded implements OnInit {
	static player: Player = Players.LocalPlayer;

	onInit(): void {
		const listeners = new Set<OnCharacterAdded>();

		Modding.onListenerAdded<OnCharacterAdded>((object) => listeners.add(object));
		Modding.onListenerRemoved<OnCharacterAdded>((object) => listeners.delete(object));

		CharacterAdded.player.CharacterAdded.Connect((character: Model) => {
			for (const listener of listeners) {
				task.spawn(() => listener.onCharacterAdded(character));
			}
		});

		if (CharacterAdded.player.Character) {
			for (const listener of listeners) {
				task.spawn(() => listener.onCharacterAdded(CharacterAdded.player.Character as Model));
			}
		}
	}
}

@Controller({})
export class PostCameraRender implements OnInit {
	onInit(): void {
		const listeners = new Set<OnPostCameraRender>();

		Modding.onListenerAdded<OnPostCameraRender>((object) => listeners.add(object));
		Modding.onListenerRemoved<OnPostCameraRender>((object) => listeners.delete(object));

		RunService.BindToRenderStep("onPostCameraRender", Enum.RenderPriority.Camera.Value + 1, (deltaTime: number) => {
			for (const listener of listeners) {
				task.spawn(() => listener.onPostCameraRender(deltaTime));
			}
		});
	}
}

@Controller({})
export class PreCameraRender implements OnInit {
	onInit(): void {
		const listeners = new Set<OnPreCameraRender>();

		Modding.onListenerAdded<OnPreCameraRender>((object) => listeners.add(object));
		Modding.onListenerRemoved<OnPreCameraRender>((object) => listeners.delete(object));

		RunService.BindToRenderStep("onPreCameraRender", Enum.RenderPriority.Camera.Value - 1, (deltaTime: number) => {
			for (const listener of listeners) {
				task.spawn(() => listener.onPreCameraRender(deltaTime));
			}
		});
	}
}

@Controller({})
export class CameraRender implements OnInit {
	onInit(): void {
		const listeners = new Set<OnCameraRender>();

		Modding.onListenerAdded<OnCameraRender>((object) => listeners.add(object));
		Modding.onListenerRemoved<OnCameraRender>((object) => listeners.delete(object));

		RunService.BindToRenderStep("onPreCameraRender", Enum.RenderPriority.Camera.Value, (deltaTime: number) => {
			for (const listener of listeners) {
				task.spawn(() => listener.onCameraRender(deltaTime));
			}
		});
	}
}

@Controller({})
export class InputBegin implements OnInit {
	onInit(): void | Promise<void> {
		const listeners = new Set<OnInputBegin>();

		Modding.onListenerAdded<OnInputBegin>((object) => listeners.add(object));
		Modding.onListenerRemoved<OnInputBegin>((object) => listeners.delete(object));

		UserInputService.InputBegan.Connect((inputObject: InputObject, gameProcessed: boolean) => {
			if (gameProcessed) return;
			for (const listener of listeners) {
				task.spawn(() => listener.onInputBegin(inputObject));
			}
		});
	}
}

@Controller({})
export class InputEnd implements OnInit {
	onInit(): void | Promise<void> {
		const listeners = new Set<OnInputEnd>();

		Modding.onListenerAdded<OnInputEnd>((object) => listeners.add(object));
		Modding.onListenerRemoved<OnInputEnd>((object) => listeners.delete(object));

		UserInputService.InputEnded.Connect((inputObject: InputObject) => {
			for (const listener of listeners) {
				task.spawn(() => listener.onInputEnd(inputObject));
			}
		});
	}
}
