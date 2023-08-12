import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { offsetFromPivot } from "shared/utilities/cframe_utility";
import { Dependency } from "@flamework/core";
import { Camera } from "client/controllers/camera";

export class Sway implements Node {
	private camera = Dependency<Camera>();

	preUpdate(deltaTime: number, character: Model, equippedItem: EquippedItem): void {
		const cameraDelta = this.camera.getRotationDelta();
		// print(cameraDelta);
		// const cameraDelta = UserInputService.GetMouseDelta();
		print(cameraDelta);
		equippedItem.springs.Sway.impulse(new Vector3(cameraDelta.Y / 1000, -cameraDelta.X / 1000));
	}

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		const offset = equippedItem.springs.Sway.getOffset();
		return offsetFromPivot(currentCFrame, equippedItem.item.CenterPart.CFrame, CFrame.Angles(offset.X, offset.Y, 0));
	}
}
