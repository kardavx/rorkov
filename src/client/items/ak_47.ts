import { BaseItem } from "./base_item";
export class AK47 extends BaseItem {
	recoil = 5 as number;
	mode = "single" as string;
	burst = 3 as number;

	equip() {}
	unequip() {}
	onRender(dt: number) {}

	constructor() {
		super();
	}
}
