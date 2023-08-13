import { Controller } from "@flamework/core";
import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { inverseLerp } from "shared/sine_utility";
import { Workspace } from "@rbxts/services";

@Controller({})
export class Pullback implements Node {
	private pullBack: CFrame = new CFrame();

	preUpdate(deltaTime: number, playerVelocity: number, equippedItem: EquippedItem, camera: Camera, raycastParams: RaycastParams): void {
		const firePart: BasePart | undefined = equippedItem.viewmodel.item.FindFirstChild("FirePart") as BasePart | undefined;

		const origin = camera.CFrame.Position;
		const direction = firePart!.CFrame.Position.sub(origin);

		const raycastResult = Workspace.Raycast(origin, direction, raycastParams);
		let distance = 0;

		if (raycastResult) {
			distance = direction.Magnitude - origin.sub(raycastResult.Position).Magnitude;
		}

		if (distance >= 2) {
			print(inverseLerp(0, 6, math.clamp(distance, 0, 6)));
			this.pullBack = new CFrame().Lerp(new CFrame(2, 0, 0).mul(CFrame.Angles(0, math.pi / 2, 30)), inverseLerp(2, 4, math.clamp(distance, 2, 4)));
			return;
		}

		this.pullBack = this.pullBack.Lerp(new CFrame(0, 0, math.clamp(distance, 0, 3)), 5 * deltaTime);
	}

	update(deltaTime: number, currentCFrame: CFrame, playerVelocity: number, equippedItem: EquippedItem, camera: Camera): CFrame {
		return currentCFrame.mul(this.pullBack);
	}
}
