import { ReplicatedStorage as shared } from "@rbxts/services";
import { Animations } from "shared/configurations/weapons/animations/shared";

export const getItemConfigurations = () => {
	// const fetchedAnimations: { [itemName in string]: Animations } = {};
	// const configurations = shared.FindFirstChild("configurations") as Folder;
	// if (!configurations) return;
	// const weaponConfigurations = configurations.FindFirstChild("weapons") as Folder;
	// if (!weaponConfigurations) return;
	// const animations = weaponConfigurations.FindFirstChild("animations") as Folder;
	// if (!animations) return;
	// animations.GetChildren().forEach((item) => {
	// 	if (!item.IsA("ModuleScript")) return;
	// 	const itemAnimations = require(item) as { default: Animations };
	// 	if (itemAnimations.default === undefined) return;
	// 	fetchedAnimations[item.Name] = itemAnimations.default;
	// });
	// return fetchedAnimations;
};

export const getItemAnimations = () => {
	const fetchedAnimations: { [itemName in string]: Animations } = {};

	const configurations = shared.FindFirstChild("configurations") as Folder;
	if (!configurations) return;
	const weaponConfigurations = configurations.FindFirstChild("weapons") as Folder;
	if (!weaponConfigurations) return;

	const animations = weaponConfigurations.FindFirstChild("animations") as Folder;
	if (!animations) return;

	animations.GetChildren().forEach((item) => {
		if (!item.IsA("ModuleScript")) return;

		const itemAnimations = require(item) as { default: Animations };
		if (itemAnimations.default === undefined) return;

		fetchedAnimations[item.Name] = itemAnimations.default;
	});

	return fetchedAnimations;
};
