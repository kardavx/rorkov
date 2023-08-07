import { Controller, OnRender, OnStart } from "@flamework/core";
import { ReplicatedStorage as shared, Workspace } from "@rbxts/services";
import { Spring } from "shared/math_utility";
import { Input } from "./input";
import { InventoryBinds, Viewmodel, Alphas, Springs, EquippedItem, ViewmodelWithItem, Item, UpdatedSprings, Offsets } from "client/types/items";
import State from "shared/state";
import setChildBasePartsProperties from "shared/set_child_baseparts_properites";
import welder from "shared/welder";

@Controller({})
export class Items implements OnStart, OnRender {
	static inventoryBinds: InventoryBinds = [
		Enum.KeyCode.One,
		Enum.KeyCode.Two,
		Enum.KeyCode.Three,
		Enum.KeyCode.Four,
		Enum.KeyCode.Five, 
		Enum.KeyCode.Six, 
		Enum.KeyCode.Seven, 
		Enum.KeyCode.Eight, 
		Enum.KeyCode.Nine
	];

	static data = shared.WaitForChild("data") as Folder;
	static viewmodel = Items.data.FindFirstChild("viewmodel") as Viewmodel;
	static items = Items.data.FindFirstChild("items") as Folder;
	static blockingStates = ["reloading", "magChecking"];
	static camera = Workspace.CurrentCamera
	static unresetableSprings = []

	private Springs: Springs = {
		Recoil: new Spring(1,1,1,1),
		Sway: new Spring(1,1,1,1)
	}
	private inventory = ["SR-16"];
	private equippedItem: EquippedItem | undefined;
	private desiredNextSlot: number | undefined;
	private state: State = new State();

	constructor(private input: Input) {}

	private resetSprings() {
		for (const [springName, springObject] of pairs(this.Springs)) {
			const isResetable = Items.unresetableSprings.find((unresetableSpringName: string) => unresetableSpringName === springName) === undefined
			if (isResetable) springObject.reset()
		}
	}

	private getUpdatedSprings(dt: number) {
		const updatedSprings: UpdatedSprings = {}

		for (const [springName, springObject] of pairs(this.Springs)) {
			updatedSprings[springName] = springObject.getOffset(dt)
		}

		return updatedSprings
	}

	private createViewmodel(itemName: string): ViewmodelWithItem {
		const item = Items.items.FindFirstChild(itemName) as Item
		if (item === undefined) {
			throw `couldn't find item ${itemName}`
		}

		const viewmodelClone: Viewmodel = Items.viewmodel.Clone()
		const itemClone: Item = item.Clone()

		viewmodelClone.Name = 'Viewmodel'
		itemClone.Name = 'Item'

		if (!viewmodelClone.PrimaryPart) viewmodelClone.PrimaryPart = viewmodelClone.HumanoidRootPart
		if (!itemClone.PrimaryPart) itemClone.PrimaryPart = itemClone.Grip

		const properties = {Anchored: false, CanCollide: false, CanQuery: false, CanTouch: false}
		setChildBasePartsProperties(viewmodelClone, properties, ['HumanoidRootPart'])
		setChildBasePartsProperties(itemClone, properties)

		welder(itemClone)
		viewmodelClone.Parent = Items.camera
		itemClone.Parent = viewmodelClone

		viewmodelClone.PrimaryPart.Anchored = true
		const motor = new Instance('Motor6D')
		motor.Part0 = viewmodelClone.UpperTorso
		motor.Part1 = itemClone.PrimaryPart
		motor.Parent = itemClone.PrimaryPart

		return viewmodelClone as ViewmodelWithItem
	}

	private createOffsets = (viewmodel: ViewmodelWithItem) => ({
		HumanoidRootPartToCameraBoneDistance: viewmodel.HumanoidRootPart.Position.Y - viewmodel.CameraBone.Position.Y
	})

	private createAlphas = () => ({
		testAlpha: 0
	})

	private createEquippedItem(itemName: string) {
		const viewmodel: ViewmodelWithItem = this.createViewmodel(itemName)
		const item: Item = viewmodel.Item
		const alphas: Alphas = this.createAlphas()
		const offsets: Offsets = this.createOffsets(viewmodel)

		return {
			viewmodel,
			item,
			alphas,
			offsets
		}
	}

	private destroyEquippedItem() {
		this.equippedItem!.item.Destroy()
		this.equippedItem!.viewmodel.Destroy()
		table.clear(this.equippedItem!.offsets)
		table.freeze(this.equippedItem!.offsets)
		table.clear(this.equippedItem!.alphas)
		table.freeze(this.equippedItem!.alphas)
		this.equippedItem = undefined
	}

	private equip(slot: number) {
		const itemName = this.inventory[slot];
		if (itemName === undefined) return;

		this.state.activateState("equipping");
		this.equippedItem = this.createEquippedItem(itemName)
		this.state.disableState("equipping");

		if (this.desiredNextSlot !== undefined) {
			this.unequip();
			return;
		}
	}

	private unequip() {
		this.state.activateState("unequipping");
		// do unequip logic
		this.destroyEquippedItem()
		this.resetSprings()
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
				"Hotbar",
				keyCode.Name,
				(inputState: boolean) => {
					if (!inputState || this.state.isAnyActive(Items.blockingStates)) return;
					this.selectSlot(slot);
				},
				keyCode,
			);
		});
	}

	onRender(dt: number): void {
		if (this.equippedItem) {
			const updatedSprings: UpdatedSprings = this.getUpdatedSprings(dt)
			const baseCFrame = Items.camera!.CFrame.mul(new CFrame(0,this.equippedItem.offsets.HumanoidRootPartToCameraBoneDistance as number * -1,0))
			let finalCFrame = baseCFrame

			for (const [_, updatedSpringOffset] of pairs(updatedSprings)) {
				finalCFrame.mul(CFrame.Angles(updatedSpringOffset.X, updatedSpringOffset.Y, updatedSpringOffset.Z))
			}

			this.equippedItem.viewmodel.PivotTo(finalCFrame)
		}
	}
}
