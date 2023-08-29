import { TweenService } from "@rbxts/services";
import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { FOVModifier } from "client/controllers/camera";
// import { offsetFromPivot } from "shared/utilities/cframe_utility";

export class Aim extends Node {
	private aimFactor = new Instance("NumberValue");
	private aimFOVModifier = FOVModifier.create("aim");
	private aimCFrame = new CFrame();

	initialize(character: Model, equippedItem: EquippedItem): void {
		this.aimFactor.Value = 0;
		equippedItem.state.bindToStateChanged("aiming", (state: boolean) => {
			TweenService.Create(this.aimFactor, new TweenInfo(0.6, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out), { Value: state ? 1 : 0 }).Play();

			if (equippedItem.item.Sights![0].AimPart)
				this.aimFOVModifier.setDifference(
					state
						? equippedItem.item.Sights![0].AimPart.GetAttribute("fov") !== undefined
							? (equippedItem.item.Sights![0].AimPart.GetAttribute("fov") as number)
							: (equippedItem.configuration.properties.aimFOVDifference as number)
						: 0,
				);
		});
	}

	preUpdate(deltaTime: number, character: Model, equippedItem: EquippedItem): void {
		this.aimCFrame = equippedItem.item.Sights![0].AimPart.CFrame.mul(new CFrame(0, 0, equippedItem.configuration.properties.aimOffset as number));
	}

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		return currentCFrame.Lerp(
			currentCFrame.mul(new CFrame(0, (equippedItem.offsets.HumanoidRootPartToCameraBoneDistance as number) * -1, 0)).mul(
				this.aimCFrame.ToObjectSpace(currentCFrame),
				// .mul(
				// 	new CFrame().Lerp(
				// 		equippedItem.viewmodel.Torso.GunJoint.Transform.mul(
				// 			new CFrame(0.616989672, 0.59187007, -2.0026648, 1, 0, 0, 0, 1, 0, 0, 0, 1).Inverse(),
				// 		),
				// 		0.4,
				// 	),
				// ),
			),
			this.aimFactor.Value,
		);
	}
}
