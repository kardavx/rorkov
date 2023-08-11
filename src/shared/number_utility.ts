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
