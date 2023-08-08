import { Signal } from "@rbxts/beacon";

export class BaseItem {
	equip() {}
	unequip() {}
	createOffsets() {}
	createAlphas() {}
	resetSprings() {}
	getUpdatedSprings() {}
}

//fireowanie z poziomu baseitem signale equip i unequip i lapanie go w items
