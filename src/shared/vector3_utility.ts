export const getAngleFromNormal = (normal: Vector3) => {
	return math.deg(math.acos(normal.Dot(Vector3.yAxis)));
};
