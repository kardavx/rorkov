import { Modding, Controller, OnInit } from "@flamework/core";
import { Players } from "@rbxts/services";

export interface OnCharacterAdded {
	onCharacterAdded(player: Player, character: Model): void;
}

@Controller({})
class CharacterAdded implements OnInit {
	static player: Player = Players.LocalPlayer;

	onInit(): void {
		const listeners = new Set<OnCharacterAdded>();

		Modding.onListenerAdded<OnCharacterAdded>((object) => listeners.add(object));
		Modding.onListenerRemoved<OnCharacterAdded>((object) => listeners.delete(object));

		CharacterAdded.player.CharacterAdded.Connect((character: Model) => {
			for (const listener of listeners) {
				task.spawn(() => listener.onCharacterAdded(CharacterAdded.player, character));
			}
		});

		if (CharacterAdded.player.Character) {
			for (const listener of listeners) {
				task.spawn(() =>
					listener.onCharacterAdded(CharacterAdded.player, CharacterAdded.player.Character as Model),
				);
			}
		}
	}
}
