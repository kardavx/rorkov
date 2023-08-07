import { Controller } from "@flamework/core";
import { OnCharacterAdded } from "./core";

@Controller({})
export class Test implements OnCharacterAdded {
	onCharacterAdded(character: Model): void {
		print(`${character.Name} added!`);
	}
}
