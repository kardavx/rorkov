export interface Spring {
	Mass: number;
	Damping: number;
	Constant: number;
	InitialOffset: number;
	InitialVelocity: number;
	ExternalForce: number;
	startTick: number;
	f: DifEqFunctionTable | undefined;
}

export interface DifEqFunctionTable {
	Offset: (number: number) => number;
	Velocity: (number: number) => number;
	Acceleration: (number: number) => number;
}

const overDamping = (m: number, a: number, k: number, y0: number, v0: number, f: number): DifEqFunctionTable => {
	const delta = (a * a) / (m * m) - (4 * k) / m;
	const d = -1 / 2;
	const w1 = a / m + math.sqrt(delta);
	const w2 = a / m - math.sqrt(delta);
	const r1 = d * w1;
	const r2 = d * w2;
	const c1 = (r2 * y0 - v0) / (r2 - r1);
	const c2 = (r1 * y0 - v0) / (r1 - r2);
	const yp = f / k;

	return {
		Offset: (t: number) => c1 * math.exp(r1 * t) + c2 * math.exp(r2 * t) + yp,
		Velocity: (t: number) => c1 * r1 * math.exp(r1 * t) + c2 * r2 * math.exp(r2 * t),
		Acceleration: (t: number) => c1 * r1 * r1 * math.exp(r1 * t) + c2 * r2 * r2 * math.exp(r2 * t),
	};
};

const criticalDamping = (m: number, a: number, k: number, y0: number, v0: number, f: number): DifEqFunctionTable => {
	const r = -a / (2 * m);
	const c1 = y0;
	const c2 = v0 - r * y0;
	const yp = f / k;

	return {
		Offset: (t: number) => math.exp(r * t) * (c1 + c2 * t) + yp,
		Velocity: (t: number) => math.exp(r * t) * (c2 * r * t + c1 * r + c2),
		Acceleration: (t: number) => r * math.exp(r * t) * (c2 * r * t + c1 * r + 2 * c2),
	};
};

const underDamping = (m: number, a: number, k: number, y0: number, v0: number, f: number): DifEqFunctionTable => {
	const delta = (a * a) / (m * m) - (4 * k) / m;
	const r = -a / (2 * m);
	const s = math.sqrt(-delta);
	const c1 = y0;
	const c2 = (v0 - r * y0) / s;
	const yp = f / k;

	return {
		Offset: (t: number) => math.exp(r * t) * (c1 * math.cos(s * t) + c2 * math.sin(s * t)) + yp,
		Velocity: (t: number) => -math.exp(r * t) * ((c1 * s - c2 * r) * math.sin(s * t) + (-c2 * s - c1 * r) * math.cos(s * t)),
		Acceleration: (t: number) =>
			-math.exp(r * t) * ((c2 * s * s + 2 * c1 * r * s - c2 * r * r) * math.sin(s * t) + (c1 * s * s - 2 * c2 * r * s - c1 * r * r) * math.cos(s * t)),
	};
};

export const f = (Spring: Spring): DifEqFunctionTable => {
	const { InitialOffset: y0, InitialVelocity: v0, ExternalForce: f } = Spring;
	const { Mass: m, Damping: a, Constant: k } = Spring;
	const delta = (a * a) / (m * m) - (4 * k) / m;

	if (delta > 0) {
		return overDamping(m, a, k, y0, v0, f);
	} else if (delta === 0) {
		return criticalDamping(m, a, k, y0, v0, f);
	} else {
		return underDamping(m, a, k, y0, v0, f);
	}
};
