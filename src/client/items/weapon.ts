import { BaseItem } from "./base_item";
import { Actions } from "client/types/items";

export class Weapon extends BaseItem {
	static actions: Actions = new Map<Enum.KeyCode, (inputState: boolean) => void>([]);
	static states = ["reload"];
	static blockingStates = ["reload"];
	static springs = {};

	constructor(itemName: string) {
		super(itemName, Weapon.states, Weapon.blockingStates, Weapon.springs, Weapon.actions);
	}
}
