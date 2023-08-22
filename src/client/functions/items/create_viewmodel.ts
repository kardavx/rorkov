import { Workspace, ReplicatedStorage as shared } from "@rbxts/services";
import { Viewmodel, ViewmodelWithItem, Item } from "client/types/items";
import { Functions } from "client/network";

import setDescendantBasePartsProperties from "shared/set_descendant_baseparts_properites";
import welder from "shared/welder";
import { log } from "shared/log_message";
import { scaleOnAxis } from "shared/utilities/model_utility";

const data = shared.WaitForChild("data") as Folder;
const viewmodel = data.FindFirstChild("viewmodel") as Viewmodel;
const items = data.FindFirstChild("items") as Folder;
const camera = Workspace.CurrentCamera as Camera;

const ignoredLimbs = ["Torso"];

const weldOutfitElementsToCharacter = (limb: Model, character: Model) => {
	if (!limb.IsA("Model")) return;

	const correspondingLimb = character.FindFirstChild(limb.Name) as BasePart;
	if (!correspondingLimb) {
		log("warning", `Improper limb name, couldn't find limb name of ${limb.Name}`);
		limb.Destroy();
		return;
	}

	if (!correspondingLimb.IsA("BasePart")) {
		log("warning", `Limb name ${limb.Name} found, but it isn't a basepart`);
		limb.Destroy();
		return;
	}

	const sizeDifference = correspondingLimb.Size.div(limb.PrimaryPart!.Size);

	scaleOnAxis(limb, sizeDifference.X, sizeDifference.Y, sizeDifference.Z);
	welder(limb, limb.PrimaryPart, { Anchored: false, CanCollide: false, CanTouch: false, CanQuery: false, Massless: true });
	limb.PivotTo(correspondingLimb.CFrame);

	const topWeld = new Instance("WeldConstraint");
	topWeld.Name = "joint";
	topWeld.Part0 = correspondingLimb;
	topWeld.Part1 = limb.PrimaryPart;
	topWeld.Parent = limb.PrimaryPart;
};

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

	Functions.getCurrentTop
		.invokeWithTimeout(5)
		.andThen((top: Model) => {
			const clonedTop = top.Clone();
			clonedTop.Name = "top";
			clonedTop.Parent = viewmodelClone;

			clonedTop.GetChildren().forEach((limb) => {
				if (!limb.IsA("Model")) return;

				if (ignoredLimbs.find((ignoredLimb: string) => ignoredLimb === limb.Name) !== undefined) {
					limb.Destroy();
					return;
				}
				weldOutfitElementsToCharacter(limb, viewmodelClone);
			});
			//do something
		})
		.catch((reason) => {
			log("warning", `error from the network handler: ${reason}`);
		});

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
