import { TweenService } from "@rbxts/services";
import { Node } from "../node";
import { EquippedItem } from "client/types/items";
// import { offsetFromPivot } from "shared/utilities/cframe_utility";

export class Aim implements Node {
	private aimFactor = new Instance("NumberValue");
	private aimCFrame = new CFrame();

	initialize(character: Model, equippedItem: EquippedItem): void {
		this.aimFactor.Value = 0;
		equippedItem.state.bindToStateChanged("aiming", (state: boolean) => {
			print("essa");
			TweenService.Create(this.aimFactor, new TweenInfo(0.6, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out), { Value: state ? 1 : 0 }).Play();
		});
	}

	preUpdate(deltaTime: number, character: Model, equippedItem: EquippedItem): void {
		this.aimCFrame = equippedItem.item.Sights![0].AimPart.CFrame.mul(new CFrame(0, 0, 1.3));
	}

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		return currentCFrame.Lerp(
			currentCFrame
				.mul(new CFrame(0, (equippedItem.offsets.HumanoidRootPartToCameraBoneDistance as number) * -1, 0))
				.mul(
					this.aimCFrame
						.ToObjectSpace(currentCFrame)
						.mul(
							new CFrame().Lerp(
								equippedItem.viewmodel.Torso.GunJoint.Transform.mul(
									new CFrame(0.616989672, 0.59187007, -2.0026648, 1, 0, 0, 0, 1, 0, 0, 0, 1).Inverse(),
								),
								0.4,
							),
						),
				),
			this.aimFactor.Value,
		);
	}
}
