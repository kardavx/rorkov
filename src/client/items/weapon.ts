import { BaseItem } from "./base_item";
import { Input } from "client/controllers/input";

export class Weapon extends BaseItem {
	protected states = ["reload"];

	constructor(input: Input, itemName: string) {
		print("lol");
		super(input, itemName);
		print(this.states);
		this.states = [...this.states, ...BaseItem.states];
		print(this.states);
	}
}
