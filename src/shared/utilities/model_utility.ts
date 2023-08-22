import { log } from "shared/log_message";

export const scaleOnAxis = (model: Model, x = 1, y = 1, z = 1) => {
	if (!model.PrimaryPart) {
		log("warning", `Can't do scaling on models without a primary part!`);
		return;
	}

	const primaryPartCFrame = model.PrimaryPart.CFrame;

	model.GetChildren().forEach((child) => {
		if (!child.IsA("BasePart")) return;

		const offset = child.CFrame.ToObjectSpace(primaryPartCFrame).Position;
		const biggerOffset = new Vector3(offset.X, offset.Y * -y, offset.Z);

		if (child.GetAttribute("nonScaleable") === undefined || child.GetAttribute("nonScaleable") === false)
			child.Size = new Vector3(child.Size.X * x, child.Size.Y * y, child.Size.Z * z);

		child.Position = primaryPartCFrame.mul(biggerOffset);
	});
};
