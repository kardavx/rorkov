import { Controller, OnStart, OnInit } from "@flamework/core";
import { ReplicatedStorage } from "@rbxts/services";
import { Input } from "./input";
import State from "shared/state";

type InventoryBinds = Enum.KeyCode[];
type Sights = Sight[];

interface Viewmodel extends Model {
	UpperTorso: BasePart;
	HumanoidRootPart: BasePart;
}

interface ViewmodelWithItem extends Viewmodel {
	Item: Item;
}

interface SightElements extends Model {
	ScopedIn: Model;
	ScopedOut: Model;
}

interface Sight extends Model {
	AimPart: BasePart;
	Elements: SightElements;
	Projector?: BasePart;
}

interface Item extends Model {
	Grip: BasePart;
	Sights?: Sights;
	Muzzle?: BasePart;
}

interface EquippedItem {
	viewmodel: ViewmodelWithItem;
	item: Item;
}

@Controller({})
export class Items implements OnStart {
	static inventoryBinds: InventoryBinds = [Enum.KeyCode.One, Enum.KeyCode.Two, Enum.KeyCode.Three];
	static data = ReplicatedStorage.WaitForChild("data") as Folder;
	static viewmodel = Items.data.FindFirstChild("viewmodel") as Viewmodel;
	static items = Items.data.FindFirstChild("items") as Folder;
	static blockingStates = ["reloading", "magChecking"];

	private inventory = ["SR-16"];
	private equippedItem: EquippedItem | undefined;
	private desiredNextSlot: number | undefined;
	private state: State = new State();

	/**
	 * Items manager, edit things in client/items instead of this
	 *
	 */
	constructor(private input: Input) {}

	// private createViewmodel(itemName: string): ViewmodelWithItem {}

	private equip(slot: number) {
		const itemName = this.inventory[slot];
		if (itemName === undefined) return;

		this.state.activateState("equipping");

		// const viewmodel = this.createViewmodel();

		this.state.disableState("equipping");

		if (this.desiredNextSlot !== undefined) {
			this.unequip();
			return;
		}
	}

	private unequip() {
		// do unequip logic
		this.state.activateState("unequipping");

		this.state.disableState("unequipping");

		if (this.desiredNextSlot !== undefined) {
			this.equip(this.desiredNextSlot);
			this.desiredNextSlot = undefined;
		}
	}

	private selectSlot(slot: number) {
		if (!this.equippedItem) {
			this.equip(slot);
		} else {
			this.desiredNextSlot = slot;
		}
	}

	onStart() {
		Items.inventoryBinds.forEach((keyCode: Enum.KeyCode, slot: number) => {
			this.input.bindInput(
				"Items",
				keyCode.Name,
				(inputState: boolean) => {
					if (!inputState || this.state.isAnyActive(Items.blockingStates)) return;
					this.selectSlot(slot);
				},
				keyCode,
			);
		});
	}
}
