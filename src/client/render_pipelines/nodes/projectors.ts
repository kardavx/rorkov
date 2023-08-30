import { Workspace } from "@rbxts/services";
import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { validateType } from "shared/utilities/types_utility";
import { Camera as CameraController } from "client/controllers/camera";

const camera = Workspace.CurrentCamera as Camera;
const acceptedClassNames = ["ImageLabel", "Frame"] as const;

const updateProjector = (scope: BasePart) => {
	const texture = scope.FindFirstChild("Container") as SurfaceGui;
	texture.Adornee = scope;

	const clippingFrame = texture.FindFirstChild("ClippingFrame") as Frame;

	clippingFrame.GetChildren().forEach((reticle) => {
		if (!acceptedClassNames.find((acceptedClassName) => acceptedClassName === reticle.ClassName)) return;
		const validatedReticle = validateType<ImageLabel | Frame>(reticle as ImageLabel | Frame);

		if (reticle.GetAttribute("Scalable") === true) {
			const size = math.clamp(camera.FieldOfView / CameraController.baseFOV, 0, 1);
			const originalSize = validatedReticle.GetAttribute("originalSize") as UDim2;
			validatedReticle.Size = validatedReticle.Size.Lerp(new UDim2(originalSize.X.Scale * size, 0, originalSize.Y.Scale * size, 0), 0.2);
		}

		const distScale = scope.CFrame.PointToObjectSpace(camera.CFrame.Position).div(scope.Size);
		validatedReticle.Position = validatedReticle.Position.Lerp(new UDim2(0.5 + distScale.X, 0, 0.5 - distScale.Y, 0), 0.2);
	});
};

export class Projectors extends Node {
	initialize(character: Model, equippedItem: EquippedItem): void {
		if (equippedItem.item.Sights) {
			equippedItem.item.Sights.GetChildren().forEach((Sight) => {
				const projector = Sight.FindFirstChild("Projector") as BasePart;
				if (!projector) return;
				const texture = projector.FindFirstChild("Container") as SurfaceGui;
				const clippingFrame = texture.FindFirstChild("ClippingFrame") as Frame;

				clippingFrame.GetChildren().forEach((reticle) => {
					if (!acceptedClassNames.find((acceptedClassName) => acceptedClassName === reticle.ClassName)) return;
					const validatedReticle = validateType(reticle as ImageLabel | Frame);
					validatedReticle.SetAttribute("originalSize", validatedReticle.Size);
				});
			});
		}
	}

	postUpdate(deltaTime: number, character: Model, equippedItem: EquippedItem) {
		if (equippedItem.item.Sights) {
			equippedItem.item.Sights.GetChildren().forEach((Sight) => {
				if (Sight.FindFirstChild("Projector")) updateProjector(Sight.FindFirstChild("Projector") as BasePart);
			});
		}
	}
}
