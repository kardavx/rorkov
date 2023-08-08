import { Controller, OnRender, OnStart } from "@flamework/core";
import { BaseItem } from "client/items/base_item";
import { Input } from "./input";
import { Weapon } from "client/items/weapon";

@Controller({})
export class Items implements OnStart, OnRender {
	static inventoryBinds: Enum.KeyCode[] = [
		Enum.KeyCode.One,
		Enum.KeyCode.Two,
		Enum.KeyCode.Three,
		Enum.KeyCode.Four,
		Enum.KeyCode.Five,
		Enum.KeyCode.Six,
		Enum.KeyCode.Seven,
		Enum.KeyCode.Eight,
		Enum.KeyCode.Nine,
	];

	static itemNameToType: { [itemName: string]: typeof BaseItem } = {
		"SR-16": Weapon,
	};

	private inventory = ["SR-16"];
	private currentItemObject: BaseItem | undefined;

	constructor(private input: Input) {}

	private equip(slot: number) {
		const itemName = this.inventory[slot];
		if (itemName === undefined) return;

		this.currentItemObject = new Items.itemNameToType[itemName](new Input(), itemName);
	}

	private unequip() {
		this.currentItemObject!.destroy();
		this.currentItemObject = undefined;
	}

	private selectSlot(slot: number) {
		if (!this.currentItemObject) {
			this.equip(slot);
		} else {
			if (!this.currentItemObject.isAnyBlockingStateActive()) {
				this.unequip();
			}
		}
	}

	onStart() {
		Items.inventoryBinds.forEach((keyCode: Enum.KeyCode, slot: number) => {
			this.input.bindInput(
				"Hotbar",
				keyCode.Name,
				(inputState: boolean) => {
					if (!inputState) return;
					this.selectSlot(slot);
				},
				keyCode,
			);
		});
	}

	onRender(dt: number): void {
		if (this.currentItemObject) {
			this.currentItemObject.onRender(dt);
		}
	}
}
