import { OnCharacterAdded } from "./core";
import { Controller, OnRender, OnStart, OnInit, Modding } from "@flamework/core";
import { BaseItem } from "client/items/base_item";
import { Input } from "./input";
import { OnJump, OnLand, OnRunningChanged } from "./movement";

import { Weapon } from "client/items/weapon";
import { Grenade } from "client/items/grenade";
import { Useable } from "client/items/useable";

import { ItemConfig, configs } from "shared/configurations/items";
import { log } from "shared/log_message";

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

	static itemTypes: { [itemType in string]: typeof Weapon | typeof Grenade | typeof Useable } = {
		weapon: Weapon,
		grenade: Grenade,
		useable: Useable,
	};

	private inventory = ["ak_47", "tokarev_tt_33", "SR-16"];
	private currentItemObject: BaseItem | undefined;
	private currentItemSlot: number | undefined;
	private character: Model | undefined;

	constructor(private input: Input) {}

	private equip(slot: number) {
		const itemName = this.inventory[slot];
		if (itemName === undefined) return;

		const itemConfiguration = configs.get(itemName) as ItemConfig;
		if (!itemConfiguration) {
			log("warning", `Item of name ${itemName} doesn't have a configuration defined.`);
			return;
		}

		for (const listener of Items.equippedlisteners) {
			task.spawn(() => listener.onItemEquipped(itemName));
		}

		this.currentItemSlot = slot;
		this.currentItemObject = new Items.itemTypes[itemConfiguration.itemType](itemName, itemConfiguration);
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
		if (!this.currentItemObject) return;
		this.currentItemObject?.onRunningChanged(runningState);
	}
}
