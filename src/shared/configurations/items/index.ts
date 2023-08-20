import { Animations } from "./default/animations";
import { Properties } from "./default/properties";

import { weaponDefaultProperties, grenadeDefaultProperties, useableDefaultProperties } from "./default/properties";
import { weaponDefaultAnimations, grenadeDefaultAnimations, useableDefaultAnimations } from "./default/animations";

type Item = { animations: Animations; properties: Properties; itemType: string };

const items = script.GetChildren();
const ignored = ["default"];

const itemTypeToDefault: { readonly [itemType: string]: readonly [Properties, Animations] } = {
	weapon: [weaponDefaultProperties, weaponDefaultAnimations],
	grenade: [grenadeDefaultProperties, grenadeDefaultAnimations],
	useable: [useableDefaultProperties, useableDefaultAnimations],
} as const;

const attachData = (item: Item, name: string) => ({
	properties: { ...item.properties, ...itemTypeToDefault[item.itemType][0] },
	animations: { ...item.animations, ...itemTypeToDefault[item.itemType][1] },
	itemType: item.itemType,
	name,
});

export default new ReadonlyMap<string, Item>(
	(items as ModuleScript[])
		.filter((item) => ignored.find((ignoredItem: string) => ignoredItem === item.Name) === undefined)
		.map((item) => attachData(require(item) as Item, item.Name))
		.map(({ animations, properties, itemType, name }) => [name, { animations, properties, itemType }]),
);
