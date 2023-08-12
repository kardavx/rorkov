import { Actions } from "client/types/items";
import { BaseItem } from "./base_item";
import { Input } from "client/controllers/input";

export class Useable extends BaseItem {
	static actions: Actions = new Map<Enum.KeyCode, (inputState: boolean) => void>([]);
	static states = ["use"];
	static blockingStates = ["use"];
	static springs = {};

	private use = () => {
		this.state.activateState("use");

		// play use animation, and do things ig

		this.state.disableState("use");
		this.destroy();
	};

	constructor(itemName: string) {
		super(itemName, Useable.states, Useable.blockingStates, Useable.springs, Useable.actions);
	}
}
