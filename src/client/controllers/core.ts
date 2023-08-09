import { Modding, OnInit } from "@flamework/core";
import { Players } from "@rbxts/services";
import { RunService } from "@rbxts/services";

export interface OnCharacterAdded {
	onCharacterAdded(character: Model): void;
}

export interface OnPostCameraRender {
	onPostCameraRender(deltaTime: number): void;
}

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
