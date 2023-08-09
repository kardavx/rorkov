import { BaseItem } from "./base_item";
import { Input } from "client/controllers/input";
import { Actions } from "client/types/items";

export class Weapon extends BaseItem {
	static actions: Actions = new Map<Enum.KeyCode, (inputState: boolean) => void>([]);
	static states = ["reload"];
	static blockingStates = ["reload"];
	static springs = {};

	constructor(input: Input, itemName: string) {
		super(input, itemName, Weapon.states, Weapon.blockingStates, Weapon.springs, Weapon.actions);
	}
}