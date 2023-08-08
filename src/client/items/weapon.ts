import { BaseItem } from "./base_item";
import { Input } from "client/controllers/input";

export class Weapon extends BaseItem {
	static states = ["reload"];
	static blockingStates = ["reload"];
	static springs = {};

	constructor(input: Input, itemName: string) {
		super(input, itemName, Weapon.states, Weapon.blockingStates, Weapon.springs);
	}
}
