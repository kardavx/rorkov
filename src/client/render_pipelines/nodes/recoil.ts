import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { offsetFromPivot } from "shared/utilities/cframe_utility";
import { Modifier } from "client/controllers/camera";

export class Recoil extends Node {
	private cameraModifier = Modifier.create("recoil", true);

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		const offset = equippedItem.springs.Recoil.getOffset();

		const rotation = CFrame.Angles(offset.X * 2, offset.Y, 0);
		const reducedRotation = new CFrame().Lerp(rotation, 0.05);
		const actualReducedRotation = this.cameraModifier.getOffset().mul(reducedRotation);
		const [x, y, z] = actualReducedRotation.ToOrientation();
		const position = new CFrame(0, offset.X - x, offset.Z);

		this.cameraModifier.setOffset(CFrame.Angles(x, 0, z));
		return offsetFromPivot(currentCFrame, equippedItem.item.Grip.CFrame, position.mul(actualReducedRotation.Inverse()).mul(rotation));
	}
}
