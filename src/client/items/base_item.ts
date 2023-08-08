import { ReplicatedStorage as shared, Workspace } from "@rbxts/services";
import setDescendantBasePartsProperties from "shared/set_descendant_baseparts_properites";

import { Spring } from "shared/math_utility";
import { Input } from "client/controllers/input";
import State from "shared/state";
import welder from "shared/welder";

import { Viewmodel, Alphas, Springs, EquippedItem, ViewmodelWithItem, Item, UpdatedSprings, Offsets } from "client/types/items";

export class BaseItem {
	static data = shared.WaitForChild("data") as Folder;
	static viewmodel = BaseItem.data.FindFirstChild("viewmodel") as Viewmodel;
	static items = BaseItem.data.FindFirstChild("items") as Folder;
	static camera = Workspace.CurrentCamera;

	static states = ["equip", "unequip"];
	static blockingStates = ["equip", "unequip"];

	private Springs: Springs = {
		Recoil: new Spring(1, 1, 1, 1),
		Sway: new Spring(1, 1, 1, 1),
	};

	private equippedItem: EquippedItem;
	private state: State = new State(BaseItem.states);
	private idle: AnimationTrack | undefined;
	private equipanim: AnimationTrack | undefined;

	private getUpdatedSprings(dt: number) {
		const updatedSprings: UpdatedSprings = {};

		for (const [springName, springObject] of pairs(this.Springs)) {
			updatedSprings[springName] = springObject.getOffset(dt);
		}

		return updatedSprings;
	}

	private createViewmodel(itemName: string): ViewmodelWithItem {
		const item = BaseItem.items.FindFirstChild(itemName) as Item;
		if (item === undefined) throw `couldn't find item ${itemName}`;

		const viewmodelClone: Viewmodel = BaseItem.viewmodel.Clone();
		const itemClone: Item = item.Clone();

		viewmodelClone.Name = "viewmodel";
		itemClone.Name = "item";

		if (!viewmodelClone.PrimaryPart) viewmodelClone.PrimaryPart = viewmodelClone.HumanoidRootPart;
		if (!itemClone.PrimaryPart) itemClone.PrimaryPart = itemClone.Grip;

		const properties = { Anchored: false, CanCollide: false, CanQuery: false, CanTouch: false };
		setDescendantBasePartsProperties(viewmodelClone, properties, ["HumanoidRootPart"]);
		setDescendantBasePartsProperties(itemClone, properties);

		welder(itemClone);
		viewmodelClone.Parent = BaseItem.camera;
		itemClone.Parent = viewmodelClone;

		viewmodelClone.PrimaryPart.Anchored = true;
		const motor = new Instance("Motor6D");
		motor.Part0 = viewmodelClone.UpperTorso;
		motor.Part1 = itemClone.PrimaryPart;
		motor.Parent = itemClone.PrimaryPart;

		return viewmodelClone as ViewmodelWithItem;
	}

	private createOffsets = (viewmodel: ViewmodelWithItem) => ({
		HumanoidRootPartToCameraBoneDistance: viewmodel.HumanoidRootPart.Position.Y - viewmodel.CameraBone.Position.Y,
	});

	private createAlphas = () => ({
		testAlpha: 0,
	});

	private createEquippedItem = (itemName: string) => {
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
	};

	private destroyEquippedItem = () => {
		this.equippedItem!.item.Destroy();
		this.equippedItem!.viewmodel.Destroy();
		table.clear(this.equippedItem!.offsets);
		table.freeze(this.equippedItem!.offsets);
		table.clear(this.equippedItem!.alphas);
		table.freeze(this.equippedItem!.alphas);
	};

	public isAnyBlockingStateActive = (): boolean => {
		return this.state.isAnyActive(BaseItem.blockingStates);
	};

	constructor(private input: Input, private itemName: string) {
		this.state.activateState("equip");

		this.equippedItem = this.createEquippedItem(this.itemName);
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
	}

	public destroy = (): void => {
		this.state.activateState("unequip");

		this.idle!.Stop(0);
		this.equipanim!.Play(0, 10, -1);
		this.destroyEquippedItem();
		table.clear(this);
		table.freeze(this);

		this.state.disableState("unequip");
	};

	onRender = (dt: number): void => {
		const updatedSprings: UpdatedSprings = this.getUpdatedSprings(dt);
		const baseCFrame = BaseItem.camera!.CFrame.mul(new CFrame(0, this.equippedItem.offsets.HumanoidRootPartToCameraBoneDistance as number, 0));
		const finalCFrame = baseCFrame;

		for (const [_, updatedSpringOffset] of pairs(updatedSprings)) {
			finalCFrame.mul(CFrame.Angles(updatedSpringOffset.X, updatedSpringOffset.Y, updatedSpringOffset.Z));
		}

		this.equippedItem.viewmodel.PivotTo(finalCFrame);
	};
}

//fireowanie z poziomu baseitem signale equip i unequip i lapanie go w items
