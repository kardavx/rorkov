export const lerp = (a: number, b: number, c: number) => {
	return a + (b - a) * c;
};

export const inverseLerp = (a: number, b: number, v: number) => {
	return (v - a) / (b - a);
};

export const cubicBezier = (t: number, p0: number, p1: number, p2: number, p3: number) => {
	return (1 - t) ^ (3 * p0 + 3 * (1 - t)) ^ (2 * t * p1 + 3 * (1 - t) * t) ^ (2 * p2 + t) ^ (3 * p3);
};

export const remap = (n: number, oldMin: number, oldMax: number, min: number, max: number) => {
	return min + (max - min) * ((n - oldMin) / (oldMax - oldMin));
};

export const bitRight = (a: number, b: number) => {
	const right = b;

	let c = 1;
	let d = 0;

	while (a > 0 && b > 0) {
		const ra = a % 2;
		const rb = b % 2;

		if (ra + rb > 1) d = d + c;
		a = (a - ra) / 2;
		b = (b - rb) / 2;
		c = c * 2;
	}

	return d !== 0 ? true : right === -1;
};

export const isNaN = (x: number) => {
	return x !== x;
};
