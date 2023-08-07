import { Service, OnStart, Modding } from "@flamework/core";
import { Players } from "@rbxts/services";

export interface OnPlayerAdded {
	onPlayerAdded(player: Player): void;
}

export interface OnCharacterAdded {
	onCharacterAdded(player: Player, character: Model): void;
}

@Service({})
class PlayerAdded implements OnStart {
	onStart() {
		const listeners = new Set<OnPlayerAdded>();

		Modding.onListenerAdded<OnPlayerAdded>((object) => listeners.add(object));
		Modding.onListenerRemoved<OnPlayerAdded>((object) => listeners.delete(object));

		Players.PlayerAdded.Connect((player) => {
			for (const listener of listeners) {
				task.spawn(() => listener.onPlayerAdded(player));
			}
		});

		for (const player of Players.GetPlayers()) {
			for (const listener of listeners) {
				task.spawn(() => listener.onPlayerAdded(player));
			}
		}
	}
}

@Service({})
class CharacterAdded implements OnPlayerAdded {
	onPlayerAdded(player: Player): void {
		const listeners = new Set<OnCharacterAdded>();

		Modding.onListenerAdded<OnCharacterAdded>((object) => listeners.add(object));
		Modding.onListenerRemoved<OnCharacterAdded>((object) => listeners.delete(object));

		player.CharacterAdded.Connect((character: Model) => {
			for (const listener of listeners) {
				task.spawn(() => listener.onCharacterAdded(player, character));
			}
		});

		if (player.Character) {
			for (const listener of listeners) {
				task.spawn(() => listener.onCharacterAdded(player, player.Character as Model));
			}
		}
	}
}
