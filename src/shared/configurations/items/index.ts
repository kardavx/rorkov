import { Animations } from "./default/animations";
import { Properties } from "./default/properties";

import { weaponDefaultProperties, grenadeDefaultProperties, useableDefaultProperties } from "./default/properties";
import { weaponDefaultAnimations, grenadeDefaultAnimations, useableDefaultAnimations } from "./default/animations";

export type ItemConfig = { animations: Animations; properties: Properties; itemType: string };

const items = script.GetChildren();

const itemTypeToDefault: Readonly<{ [itemType: string]: [Properties, Animations] }> = {
	weapon: [weaponDefaultProperties, weaponDefaultAnimations],
	grenade: [grenadeDefaultProperties, grenadeDefaultAnimations],
	useable: [useableDefaultProperties, useableDefaultAnimations],
};

const attachData = (item: ItemConfig, name: string) => ({
	properties: { ...itemTypeToDefault[item.itemType][0], ...item.properties },
	animations: { ...itemTypeToDefault[item.itemType][1], ...item.animations },
	itemType: item.itemType,
	name,
});

export const configs = new ReadonlyMap<string, ItemConfig>(
	(items as ModuleScript[])
		.filter((item) => item.IsA("ModuleScript"))
		.map((item) => attachData(require(item) as ItemConfig, item.Name))
		.map(({ animations, properties, itemType, name }) => [name, { animations, properties, itemType }]),
);
