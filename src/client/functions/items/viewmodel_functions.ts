import { ReplicatedStorage as shared } from "@rbxts/services";
import { Viewmodel as ViewmodelType, ViewmodelWithItem, Item } from "client/types/items";

import welder from "shared/welder";

import { Dependency } from "@flamework/core";
import { Viewmodel } from "client/controllers/viewmodel";

let viewmodelController: Viewmodel | undefined;

const data = shared.WaitForChild("data") as Folder;
const items = data.FindFirstChild("items") as Folder;

const beforeEach = () => {
	if (!viewmodelController) {
		viewmodelController = Dependency<Viewmodel>();
	}
};

export const createViewmodel = (itemName: string) => {
	beforeEach();

	const item = items.FindFirstChild(itemName) as Item;
	if (item === undefined) throw `couldn't find item ${itemName}`;

	const viewmodelClone: ViewmodelType = viewmodelController!.occupyViewmodel("items") as ViewmodelType;
	if (!viewmodelClone) return;

	const itemClone: Item = item.Clone();

	itemClone.Name = "item";
	itemClone.PrimaryPart = itemClone.Grip;
	itemClone.PivotTo(new CFrame(0, 0, 0));

	const [centerOfItem, itemSize] = itemClone.GetBoundingBox();
	const centerPart: BasePart = new Instance("Part");
	centerPart.Name = "CenterPart";
	centerPart.Transparency = 1;
	centerPart.CFrame = centerOfItem;
	centerPart.Size = itemSize;
	centerPart.Parent = itemClone;

	const properties = { Anchored: false, CanCollide: false, CanQuery: false, CanTouch: false, CastShadow: true };
	welder(itemClone, itemClone.PrimaryPart, properties);
	itemClone.Parent = viewmodelClone;

	const motor = new Instance("Motor6D");
	motor.Name = "GunJoint";
	motor.Part0 = viewmodelClone.Torso;
	motor.Part1 = itemClone.PrimaryPart;
	motor.Parent = itemClone.PrimaryPart;

	viewmodelController!.refreshBones();

	return viewmodelClone as ViewmodelWithItem;
};

export const destroyViewmodel = () => {
	beforeEach();

	const currentViewmodel = viewmodelController!.getOccupiedViewmodel("items") as ViewmodelType;
	if (!currentViewmodel) return;

	const equippedItem = currentViewmodel.FindFirstChild("item") as Item;
	equippedItem.Destroy();

	viewmodelController!.deocuppyViewmodel("items");
};
