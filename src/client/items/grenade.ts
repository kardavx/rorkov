import { Actions } from "client/types/items";
import { BaseItem } from "./base_item";
import { ItemConfig } from "shared/configurations/items";

export class Grenade extends BaseItem {
	static actions: Actions = new Map<Enum.KeyCode, (inputState: boolean) => void>([]);
	static states = ["reload"];
	static blockingStates = ["reload"];
	static springs = {};

	constructor(itemName: string, itemConfiguration: ItemConfig) {
		super(itemName, itemConfiguration, Grenade.states, Grenade.blockingStates, Grenade.springs, Grenade.actions);
	}
}
