export const offsetFromPivot = (cFrame: CFrame, pivot: CFrame, offset: CFrame) => {
	const pivotToCFrameOffset = pivot.ToObjectSpace(cFrame);

	pivot = pivot.mul(offset);
	return pivot.mul(pivotToCFrameOffset);
};

export const getRotationBetween = (upVector: Vector3, normalVector: Vector3, vector: Vector3) => {
	const dot = upVector.Dot(normalVector);
	const crossVector = upVector.Cross(normalVector);
	if (dot < -0.99999) return CFrame.fromAxisAngle(vector, math.pi);

	return new CFrame(0, 0, 0, crossVector.X, crossVector.Y, crossVector.Z, 1 + dot);
};
