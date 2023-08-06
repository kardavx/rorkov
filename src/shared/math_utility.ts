const maxSpringDelta = 1 / 30;

export function isNaN(x: number) {
	return x !== x;
}

export class Spring {
	static readonly iterations = 8;
	public target = new Vector3();
	public position = new Vector3();
	public velocity = new Vector3();

	/**
	 * Spring class for manipulating Vector3 values
	 *
	 * @param mass The spring's mass - affects amplitude and initial delay
	 * @param force Spring's multiplier - affects amplitude
	 * @param damping Spring's damping - affects how the spring cancels itself out
	 * @param speed Springs speed - affects the sine wave's frequency
	 */
	public constructor(public mass = 5, public force = 50, public damping = 4, public speed = 4) {}

	/**
	 * Shove the spring off equilibrium
	 *
	 * @param force Force vector
	 */
	public shove(force: Vector3): void {
		let { X, Y, Z } = force;
		if (isNaN(X) || X === math.huge || X === -math.huge) X = 0;
		if (isNaN(Y) || Y === math.huge || Y === -math.huge) Y = 0;
		if (isNaN(Z) || Z === math.huge || Z === -math.huge) Z = 0;

		this.velocity = this.velocity.add(new Vector3(X, Y, Z));
	}

	/**
	 * Update the spring
	 *
	 * @param dt Delta time
	 * @returns New value
	 */
	public getOffset(dt: number): Vector3 {
		if (dt > maxSpringDelta) {
			const iter = math.ceil(dt / maxSpringDelta);
			for (let i = 0; i < iter; i++) {
				this.getOffset(dt / iter);
			}
			return this.position;
		}

		const scaledDt: number = (math.min(dt, 1) * this.speed) / Spring.iterations;
		for (let i = 0; i < Spring.iterations; i++) {
			const force: Vector3 = this.target.sub(this.position);
			let accel: Vector3 = force.mul(this.force).div(this.mass);

			accel = accel.sub(this.velocity.mul(this.damping));
			this.velocity = this.velocity.add(accel.mul(scaledDt));
			this.position = this.position.add(this.velocity.mul(scaledDt));
		}
		return this.position;
	}
}

/**
 * Simple class for sinusoidal motion
 */
export class SineWave {
	public constructor(
		public readonly amplitude = 1,
		public readonly frequency = 1,
		public readonly phaseShift = 0,
		public readonly verticalShift = 0,
	) {}

	/**
	 * Update wave
	 *
	 * @param dt Delta time
	 * @returns New value
	 */
	public update(dt: number): number {
		return (this.amplitude * math.sin(this.frequency * tick() + this.phaseShift) + this.verticalShift) * 60 * dt;
	}
}