import { ItemTypes, OnCharacterAdded } from "./core";
import { Controller, OnRender, OnStart } from "@flamework/core";
import { BaseItem } from "client/items/base_item";
import { Input } from "./input";

@Controller({})
export class Items implements OnStart, OnRender, OnCharacterAdded {
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

	static itemNameToType: { [itemName: string]: typeof ItemTypes[keyof typeof ItemTypes] } = {
		"SR-16": ItemTypes.Weapon,
		"RGD-5": ItemTypes.Grenade,
		Salewa: ItemTypes.Useable,
		Mayonnaise: ItemTypes.Useable,
	};

	private inventory = ["SR-16"];
	private currentItemObject: BaseItem | undefined;
	private character: Model | undefined;

	constructor(private input: Input) {}

	private equip(slot: number) {
		const itemName = this.inventory[slot];
		if (itemName === undefined) return;

		this.currentItemObject = new Items.itemNameToType[itemName](new Input(), itemName);
		this.currentItemObject.character = this.character;
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
			this.input.bindAction(`Hotbar${keyCode.Name}`, keyCode, 1, "Click", () => {
				this.selectSlot(slot);
			});
		});
	}

	onRender(dt: number): void {
		if (this.currentItemObject) {
			this.currentItemObject.onRender(dt);
		}
	}

	onCharacterAdded(character: Model): void {
		this.character = character;
	}
}
