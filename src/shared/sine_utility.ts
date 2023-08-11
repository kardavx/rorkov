export const lerp = (a: number, b: number, c: number) => {
	return a + (b - a) * c;
};

export const inverseLerp = (a: number, b: number, v: number) => {
	return (v - a) / (b - a);
};

export const cubicBezier = (t: number, p0: number, p1: number, p2: number, p3: number) => {
	return (1 - t) ^ (3 * p0 + 3 * (1 - t)) ^ (2 * t * p1 + 3 * (1 - t) * t) ^ (2 * p2 + t) ^ (3 * p3);
};
