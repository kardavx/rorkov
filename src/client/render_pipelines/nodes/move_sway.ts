import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { Players, Workspace } from "@rbxts/services";
import { Dependency } from "@flamework/core";
import { Movement } from "client/controllers/movement";
import { offsetFromPivot } from "shared/utilities/cframe_utility";

export class MoveSway implements Node {
	static player = Players.LocalPlayer;
	private movement = Dependency<Movement>();
	private moveSwayAmount = new CFrame();

	preUpdate(deltaTime: number, character: Model, equippedItem: EquippedItem): void {
		const sideDirection = this.movement.getMoveVector().X;
		const pitchDirection = this.movement.getMoveVector().Z;
		const swayMultiplier = character.PrimaryPart!.AssemblyLinearVelocity.Magnitude * 0.3;

		const swayCFrame = new CFrame((sideDirection * swayMultiplier) / 50, 0, 0).mul(
			CFrame.Angles(math.rad(pitchDirection * swayMultiplier) / 2, math.rad(sideDirection * swayMultiplier), 0),
		);

		this.moveSwayAmount = this.moveSwayAmount.Lerp(swayCFrame, 0.03);
	}

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		return offsetFromPivot(currentCFrame, equippedItem.item.CenterPart.CFrame, this.moveSwayAmount);
	}
}
