import { Controller } from "@flamework/core";
import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { Workspace } from "@rbxts/services";
import { offsetFromPivot } from "shared/utilities/cframe_utility";
import { inverseLerp } from "shared/utilities/number_utility";

@Controller({})
export class Obstruction implements Node {
	static camera = Workspace.CurrentCamera;
	static raycastParams = new RaycastParams();

	private pullBack: CFrame = new CFrame();

	preUpdate(deltaTime: number, character: Model, equippedItem: EquippedItem): void {
		Obstruction.raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
		Obstruction.raycastParams.FilterDescendantsInstances = [character, Obstruction.camera!];

		const firePart: BasePart | undefined = equippedItem.viewmodel.item.FindFirstChild("FirePart") as BasePart | undefined;

		const origin = Obstruction.camera!.CFrame.Position;
		const direction = firePart!.CFrame.Position.sub(origin);

		const raycastResult = Workspace.Raycast(origin, direction, Obstruction.raycastParams);
		const pullBackAmount = raycastResult ? math.clamp(6 - raycastResult.Distance, 0, 6) : 0;

		this.pullBack = this.pullBack.Lerp(new CFrame(0, 0, pullBackAmount), 10 * deltaTime);

		if (pullBackAmount >= 2) {
			this.pullBack = this.pullBack.Lerp(this.pullBack.mul(new CFrame(0.25, -0.5, 0).mul(CFrame.Angles(0, math.pi / 2, 0))), 10 * deltaTime);
		}
	}

	update(deltaTime: number, currentCFrame: CFrame, playerVelocity: number, equippedItem: EquippedItem, camera: Camera): CFrame {
		return offsetFromPivot(currentCFrame, equippedItem.item.CenterPart.CFrame, this.pullBack);
	}
}
