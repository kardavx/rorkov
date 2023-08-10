import { Controller, Modding, OnInit } from "@flamework/core";
import { Players } from "@rbxts/services";
import { RunService } from "@rbxts/services";
import { Weapon } from "client/items/weapon";
import { Grenade } from "client/items/grenade";
import { Useable } from "client/items/useable";

export interface OnCharacterAdded {
	onCharacterAdded(character: Model): void;
}

export interface OnPostCameraRender {
	onPostCameraRender(deltaTime: number): void;
}

export interface OnPreCameraRender {
	onPreCameraRender(deltaTime: number): void;
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

export const ItemTypes = { Weapon, Grenade, Useable };
