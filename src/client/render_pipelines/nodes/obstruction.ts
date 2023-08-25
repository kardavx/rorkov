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

	initialize(...args: unknown[]): void {}

	preUpdate(deltaTime: number, character: Model, equippedItem: EquippedItem): void {
		Obstruction.raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
		Obstruction.raycastParams.FilterDescendantsInstances = [character, Obstruction.camera!];

		const muzzle: BasePart | undefined = equippedItem.viewmodel.item.FindFirstChild("Muzzle") as BasePart | undefined;

		const origin = Obstruction.camera!.CFrame.Position;
		const direction = muzzle!.CFrame.Position.sub(origin);

		const raycastResult = Workspace.Raycast(origin, direction, Obstruction.raycastParams);
		const pullBackAmount = raycastResult ? math.clamp(6 - raycastResult.Distance, 0, 6) : 0;

		if (pullBackAmount >= 2) {
			this.pullBack = this.pullBack.Lerp(new CFrame(0.25, -0.5, pullBackAmount).mul(CFrame.Angles(0, math.pi / 2, 0)), 10 * deltaTime);
		} else {
			this.pullBack = this.pullBack.Lerp(
				new CFrame(pullBackAmount / 10, 0, pullBackAmount).mul(CFrame.Angles(0, 0, pullBackAmount / 10)),
				10 * deltaTime,
			);
		}
	}

	update(deltaTime: number, currentCFrame: CFrame, playerVelocity: number, equippedItem: EquippedItem, camera: Camera): CFrame {
		return offsetFromPivot(currentCFrame, equippedItem.item.CenterPart.CFrame, this.pullBack);
	}
}
