import { BaseItem } from "./base_item";

export class Weapon extends BaseItem {
	static states = [...BaseItem.states, "reload"];
	static blockingStates = [...BaseItem.blockingStates, "reload"];
}
