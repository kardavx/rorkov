import { OnCharacterAdded } from "./player";
import { OnStart, OnInit, Controller } from "@flamework/core";

@Controller({})
export class Core implements OnStart, OnInit, OnCharacterAdded {
	onInit() {
		print("inited");
	}

	onStart() {
		print("started");
	}

	onCharacterAdded(player: Player, character: Model): void {
		print(`Added character for ${player.Name}: `, character);
	}
}
