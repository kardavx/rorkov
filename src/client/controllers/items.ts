import { ItemTypes, OnCharacterAdded } from "./core";
import { Controller, OnRender, OnStart, OnInit, Modding } from "@flamework/core";
import { BaseItem } from "client/items/base_item";
import { Input } from "./input";
import { OnJump, OnLand, OnRunningChanged } from "./movement";

export interface OnItemEquipped {
	onItemEquipped(itemName: string): void;
}

export interface OnItemUnequipped {
	onItemUnequipped(itemName: string): void;
}

@Controller({})
export class Items implements OnInit, OnStart, OnRender, OnCharacterAdded, OnRunningChanged, OnJump, OnLand {
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
	static equippedlisteners = new Set<OnItemEquipped>();
	static unequippedlisteners = new Set<OnItemUnequipped>();

	static itemNameToType: { [itemName: string]: typeof ItemTypes[keyof typeof ItemTypes] } = {
		"SR-16": ItemTypes.Weapon,
		M19: ItemTypes.Weapon,
		"RGD-5": ItemTypes.Grenade,
		Salewa: ItemTypes.Useable,
		Mayonnaise: ItemTypes.Useable,
		ak_47: ItemTypes.Weapon,
		tokarev_tt_33: ItemTypes.Weapon,
	};

	private inventory = ["SR-16", "M19", "ak_47", "tokarev_tt_33"];
	private currentItemObject: BaseItem | undefined;
	private currentItemSlot: number | undefined;
	private character: Model | undefined;

	constructor(private input: Input) {}

	private equip(slot: number) {
		const itemName = this.inventory[slot];
		if (itemName === undefined) return;

		for (const listener of Items.equippedlisteners) {
			task.spawn(() => listener.onItemEquipped(itemName));
		}

		this.currentItemSlot = slot;
		this.currentItemObject = new Items.itemNameToType[itemName](itemName);
		this.currentItemObject.character = this.character;
	}

	private unequip() {
		const itemName = this.currentItemObject!.itemName;

		this.currentItemObject!.destroy();
		this.currentItemObject = undefined;
		this.currentItemSlot = undefined;

		for (const listener of Items.unequippedlisteners) {
			task.spawn(() => listener.onItemUnequipped(itemName));
		}
	}

	private selectSlot(slot: number) {
		if (!this.currentItemObject) {
			this.equip(slot);
		} else {
			if (this.currentItemSlot === slot) return;
			if (!this.currentItemObject.isAnyBlockingStateActive()) {
				this.unequip();
				this.equip(slot);
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

	onInit(): void {
		Modding.onListenerAdded<OnItemEquipped>((object) => Items.equippedlisteners.add(object));
		Modding.onListenerRemoved<OnItemEquipped>((object) => Items.equippedlisteners.delete(object));
		Modding.onListenerAdded<OnItemUnequipped>((object) => Items.unequippedlisteners.add(object));
		Modding.onListenerRemoved<OnItemUnequipped>((object) => Items.unequippedlisteners.delete(object));
	}

	onCharacterAdded(character: Model): void {
		this.character = character;
		if (this.currentItemObject) this.currentItemObject.character = character;
		if (this.inventory.size() > 0) {
			this.selectSlot(0);
		}
	}

	onJump(wasRunning: boolean): void {
		if (!this.currentItemObject) return;
		this.currentItemObject.onJump(wasRunning);
	}

	onLand(fallTime: number): void {
		if (!this.currentItemObject) return;
		this.currentItemObject.onLand(fallTime);
	}

	onRunningChanged(runningState: boolean): void {
		print("asd");
		if (!this.currentItemObject) return;
		this.currentItemObject?.onRunningChanged(runningState);
	}
}
