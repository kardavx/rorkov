import { Controller, OnRender, OnStart } from "@flamework/core";
import { ReplicatedStorage as shared, Workspace } from "@rbxts/services";
import { Spring } from "shared/math_utility";
import { Input } from "./input";
import {
	InventoryBinds,
	Viewmodel,
	Alphas,
	Springs,
	EquippedItem,
	ViewmodelWithItem,
	Item,
	UpdatedSprings,
	Offsets,
} from "client/types/items";
import State from "shared/state";
import setDescendantBasePartsProperties from "shared/set_descendant_baseparts_properites";
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
		Enum.KeyCode.Nine,
	];

	static data = shared.WaitForChild("data") as Folder;
	static viewmodel = Items.data.FindFirstChild("viewmodel") as Viewmodel;
	static items = Items.data.FindFirstChild("items") as Folder;
	static blockingStates = ["reloading", "magChecking"];
	static camera = Workspace.CurrentCamera;
	static unresetableSprings = [];

	private Springs: Springs = {
		Recoil: new Spring(1, 1, 1, 1),
		Sway: new Spring(1, 1, 1, 1),
	};
	private inventory = ["SR-16"];
	private equippedItem: EquippedItem | undefined;
	private desiredNextSlot: number | undefined;
	private state: State = new State(["equip", "unequip"]);
	private idle: AnimationTrack | undefined;
	private equipanim: AnimationTrack | undefined;

	constructor(private input: Input) {}

	public resetSprings() {
		for (const [springName, springObject] of pairs(this.Springs)) {
			const isResetable =
				Items.unresetableSprings.find(
					(unresetableSpringName: string) => unresetableSpringName === springName,
				) === undefined;
			if (isResetable) springObject.reset();
		}
	}

	public getUpdatedSprings(dt: number) {
		const updatedSprings: UpdatedSprings = {};

		for (const [springName, springObject] of pairs(this.Springs)) {
			updatedSprings[springName] = springObject.getOffset(dt);
		}

		return updatedSprings;
	}

	private createViewmodel(itemName: string): ViewmodelWithItem {
		const item = Items.items.FindFirstChild(itemName) as Item;
		if (item === undefined) {
			throw `couldn't find item ${itemName}`;
		}

		const viewmodelClone: Viewmodel = Items.viewmodel.Clone();
		const itemClone: Item = item.Clone();

		viewmodelClone.Name = "viewmodel";
		itemClone.Name = "item";

		if (!viewmodelClone.PrimaryPart) viewmodelClone.PrimaryPart = viewmodelClone.HumanoidRootPart;
		if (!itemClone.PrimaryPart) itemClone.PrimaryPart = itemClone.Grip;

		const properties = { Anchored: false, CanCollide: false, CanQuery: false, CanTouch: false };
		setDescendantBasePartsProperties(viewmodelClone, properties, ["HumanoidRootPart"]);
		setDescendantBasePartsProperties(itemClone, properties);

		welder(itemClone);
		viewmodelClone.Parent = Items.camera;
		itemClone.Parent = viewmodelClone;

		viewmodelClone.PrimaryPart.Anchored = true;
		const motor = new Instance("Motor6D");
		motor.Part0 = viewmodelClone.UpperTorso;
		motor.Part1 = itemClone.PrimaryPart;
		motor.Parent = itemClone.PrimaryPart;

		return viewmodelClone as ViewmodelWithItem;
	}

	public createOffsets = (viewmodel: ViewmodelWithItem) => ({
		HumanoidRootPartToCameraBoneDistance: viewmodel.HumanoidRootPart.Position.Y - viewmodel.CameraBone.Position.Y,
	});

	public createAlphas = () => ({
		testAlpha: 0,
	});

	private createEquippedItem(itemName: string) {
		const viewmodel: ViewmodelWithItem = this.createViewmodel(itemName);
		const item: Item = viewmodel.item;
		const alphas: Alphas = this.createAlphas();
		const offsets: Offsets = this.createOffsets(viewmodel);

		return {
			viewmodel,
			item,
			alphas,
			offsets,
		};
	}

	private destroyEquippedItem() {
		this.equippedItem!.item.Destroy();
		this.equippedItem!.viewmodel.Destroy();
		table.clear(this.equippedItem!.offsets);
		table.freeze(this.equippedItem!.offsets);
		table.clear(this.equippedItem!.alphas);
		table.freeze(this.equippedItem!.alphas);
		this.equippedItem = undefined;
	}

	public equip(slot: number) {
		const itemName = this.inventory[slot];
		if (itemName === undefined) return;

		this.state.activateState("equip");
		this.equippedItem = this.createEquippedItem(itemName);
		const animator: Animator = this.equippedItem.viewmodel.AnimationController!.Animator;

		const idle = new Instance("Animation");
		idle.AnimationId = `rbxassetid://${14351754927}`;

		const equip = new Instance("Animation");
		equip.AnimationId = `rbxassetid://${14351861197}`;

		this.idle = animator.LoadAnimation(idle);
		this.equipanim = animator.LoadAnimation(equip);

		this.equipanim.Play(0, 10, 1);
		this.idle.Play(0);
		this.equipanim.Stopped.Wait();

		this.state.disableState("equip");

		if (this.desiredNextSlot !== undefined) {
			this.unequip();
			return;
		}
	}

	public unequip() {
		this.state.activateState("unequip");
		// do unequip logic
		this.idle!.Stop(0);
		this.equipanim!.Play(0, 10, -1);
		this.equipanim!.Stopped.Wait();
		this.destroyEquippedItem();
		this.resetSprings();
		this.state.disableState("unequip");

		if (this.desiredNextSlot !== undefined) {
			const nextSlot = this.desiredNextSlot;
			this.desiredNextSlot = undefined;
			this.equip(nextSlot);
		}
	}

	private selectSlot(slot: number) {
		if (!this.equippedItem) {
			this.equip(slot);
		} else {
			if (this.state.isAnyActive(["equip", "unequip"])) {
				this.desiredNextSlot = slot;
			} else {
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
					if (!inputState || this.state.isAnyActive(Items.blockingStates)) return;
					this.selectSlot(slot);
				},
				keyCode,
			);
		});
	}

	onRender(dt: number): void {
		if (this.equippedItem) {
			const updatedSprings: UpdatedSprings = this.getUpdatedSprings(dt);
			const baseCFrame = Items.camera!.CFrame.mul(
				new CFrame(0, this.equippedItem.offsets.HumanoidRootPartToCameraBoneDistance as number, 0),
			);
			// const baseCFrame = Items.camera!.CFrame;
			const finalCFrame = baseCFrame;

			for (const [_, updatedSpringOffset] of pairs(updatedSprings)) {
				finalCFrame.mul(CFrame.Angles(updatedSpringOffset.X, updatedSpringOffset.Y, updatedSpringOffset.Z));
			}

			this.equippedItem.viewmodel.PivotTo(finalCFrame);
		}
	}
}
