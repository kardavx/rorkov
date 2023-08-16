import { Workspace, ReplicatedStorage as shared } from "@rbxts/services";
import { Viewmodel, ViewmodelWithItem, Item } from "client/types/items";

import setDescendantBasePartsProperties from "shared/set_descendant_baseparts_properites";
import welder from "shared/welder";

const data = shared.WaitForChild("data") as Folder;
const viewmodel = data.FindFirstChild("viewmodel") as Viewmodel;
const items = data.FindFirstChild("items") as Folder;
const camera = Workspace.CurrentCamera as Camera;

export default (itemName: string) => {
	const item = items.FindFirstChild(itemName) as Item;
	if (item === undefined) throw `couldn't find item ${itemName}`;

	const viewmodelClone: Viewmodel = viewmodel.Clone();
	const itemClone: Item = item.Clone();

	viewmodelClone.Name = "viewmodel";
	itemClone.Name = "item";

	viewmodelClone.PrimaryPart = viewmodelClone.Torso;
	itemClone.PrimaryPart = itemClone.Grip;

	viewmodelClone.PivotTo(new CFrame(0, 0, 0));
	itemClone.PivotTo(new CFrame(0, 0, 0));

	const [centerOfItem, itemSize] = itemClone.GetBoundingBox();
	const centerPart: BasePart = new Instance("Part");
	centerPart.Name = "CenterPart";
	centerPart.Transparency = 1;
	centerPart.CFrame = centerOfItem;
	centerPart.Size = itemSize;
	centerPart.Parent = itemClone;

	const properties = { Anchored: false, CanCollide: false, CanQuery: false, CanTouch: false, CastShadow: true };
	setDescendantBasePartsProperties(viewmodelClone, properties, ["HumanoidRootPart"]);
	welder(itemClone, itemClone.PrimaryPart, properties);

	viewmodelClone.Parent = camera;
	itemClone.Parent = viewmodelClone;

	viewmodelClone.PrimaryPart.Anchored = true;
	const motor = new Instance("Motor6D");
	motor.Name = "GunJoint";
	motor.Part0 = viewmodelClone.Torso;
	motor.Part1 = itemClone.PrimaryPart;
	motor.Parent = viewmodelClone.Torso;

	return viewmodelClone as ViewmodelWithItem;
};
