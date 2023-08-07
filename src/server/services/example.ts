import { OnCharacterAdded, OnPlayerAdded } from "server/services/player";
import { OnStart, OnInit, Service } from "@flamework/core";

@Service({})
export class example implements OnStart, OnInit, OnPlayerAdded, OnCharacterAdded {
	onInit() {
		print("inited");
	}

	onStart() {
		print("started");
	}

	onPlayerAdded(player: Player): void {
		print(`${player.Name} joined`);
	}

	onCharacterAdded(player: Player, character: Model): void {
		print(`Added character for ${player.Name}: `, character);
	}
}
