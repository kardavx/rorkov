import { Node } from "../node";
import { EquippedItem } from "client/types/items";

export class Slide implements Node {
	initialize(character: Model, equippedItem: EquippedItem): void {}

	preUpdate(deltaTime: number, character: Model, equippedItem: EquippedItem): void {
		if (equippedItem.item.Grip.Slide) {
			equippedItem.item.Grip.Slide.C1 = equippedItem.item.Grip.Slide.C1.mul(new CFrame(equippedItem.slide.currentSlideOffset).Inverse());
			equippedItem.slide.currentSlideOffset = equippedItem.slide.currentSlideOffset.Lerp(equippedItem.slide.targetSlideOffset, 0.8);
			equippedItem.item.Grip.Slide.C1 = equippedItem.item.Grip.Slide.C1.mul(new CFrame(equippedItem.slide.currentSlideOffset));
		}
	}

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		return currentCFrame;
	}
}
