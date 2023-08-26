import { Workspace } from "@rbxts/services";
import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { validateType } from "shared/utilities/types_utility";

const camera = Workspace.CurrentCamera as Camera;
const acceptedClassNames = ["ImageLabel", "Frame"] as const;

const updateProjector = (scope: BasePart, scopeCFrame: CFrame) => {
	const texture = scope.FindFirstChild("Container") as SurfaceGui;
	texture.Adornee = scope;

	const clippingFrame = texture.FindFirstChild("ClippingFrame") as Frame;

	clippingFrame.GetChildren().forEach((reticle) => {
		if (!acceptedClassNames.find((acceptedClassName) => acceptedClassName === reticle.ClassName)) return;
		const validatedReticle = validateType<ImageLabel | Frame>(reticle as ImageLabel | Frame);

		if (reticle.GetAttribute("Scalable") === true) {
			const size = math.clamp(camera.FieldOfView / (70 / 2), 0, 1);
			validatedReticle.Size = validatedReticle.Size.Lerp(new UDim2(1 * size, 0, 1 * size, 0), 0.5);
		}

		const distScale = scopeCFrame.PointToObjectSpace(camera.CFrame.mul(new CFrame(0, 0, 2).Position));
		validatedReticle.Position = validatedReticle.Position.Lerp(new UDim2(distScale.X, 0, distScale.Y, 0), 0.5);
	});
};

export class Projectors extends Node {
	private firstAimPartOffset = new CFrame();

	initialize(character: Model, equippedItem: EquippedItem): void {
		if (equippedItem.item.Sights && equippedItem.item.Sights.GetChildren()[0]) {
			const firstSight = equippedItem.item.Sights.FindFirstChild("1") as Model;
			if (firstSight && firstSight.FindFirstChild("Projector")) {
				this.firstAimPartOffset = (firstSight.FindFirstChild("Projector") as BasePart).CFrame.ToObjectSpace(equippedItem.item.PrimaryPart!.CFrame);
			}
		}
	}

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		if (equippedItem.item.Sights) {
			equippedItem.item.Sights.GetChildren().forEach((Sight) => {
				if (Sight.FindFirstChild("Projector"))
					updateProjector(Sight.FindFirstChild("Projector") as BasePart, currentCFrame.mul(this.firstAimPartOffset));
			});
		}

		return currentCFrame;
	}
}
