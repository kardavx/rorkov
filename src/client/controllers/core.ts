import { Modding, Controller, OnInit } from "@flamework/core";
import { Players } from "@rbxts/services";
import { Weapon } from "client/items/weapon";
import { Grenade } from "client/items/grenade";
import { Useable } from "client/items/useable";

export interface OnCharacterAdded {
	onCharacterAdded(character: Model): void;
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

export const ItemTypes = { Weapon, Grenade, Useable };
