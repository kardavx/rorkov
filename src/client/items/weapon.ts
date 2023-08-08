import { BaseItem } from "./base_item";

export class Weapon extends BaseItem {
	name: string;
	ammo = 3 as number;

	equip() {}
	unequip() {}
	onRender(dt: number) {}

	constructor(n: string) {
		super();
		this.name = n;
	}
}
