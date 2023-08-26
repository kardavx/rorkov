import { Actions } from "client/types/items";
import { BaseItem } from "./base_item";
import { Input } from "client/controllers/input";

export class Grenade extends BaseItem {
	static actions: Actions = new Map<Enum.KeyCode, (inputState: boolean) => void>([]);
	static states = ["reload"];
	static blockingStates = ["reload"];
	static springs = {};

	constructor(itemName: string) {
		super(itemName, Grenade.states, Grenade.blockingStates, Grenade.springs, Grenade.actions);
	}
}
