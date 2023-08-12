export const isCharacterGrounded = (character: Model): boolean => {
	const humanoid = character.FindFirstChild("Humanoid") as Humanoid;
	if (!humanoid) return false;

	return humanoid.FloorMaterial !== Enum.Material.Air;
};

export const getCharacterSpeed = (character: Model): number => {
	const humanoidRootPart = character.FindFirstChild("HumanoidRootPart") as BasePart;
	if (!humanoidRootPart) return 0;

	return humanoidRootPart.AssemblyLinearVelocity.Magnitude;
};
