export class Sine {
	/**
	 * Simple class for sinusoidal motion
	 */
	public constructor(private amplitude: number, private frequency: number, private phase: number = 0, private multiplier: number = 0.1) {}

	/**
	 * Change frequency of the sine wave, phase gets adjusted
	 *
	 * @param frequency New frequency to set to
	 */
	public setFrequency = (frequency: number): void => {
		if (frequency === this.frequency) return;

		const currentTick = os.clock();
		const oldArgument = this.frequency * currentTick + this.phase;
		this.frequency = frequency;
		this.phase = oldArgument - this.frequency * currentTick;
	};

	public setAmplitude = (amplitude: number): void => {
		this.amplitude = amplitude;
	};

	/**
	 * Update wave
	 *
	 * @returns New value
	 */
	public update = (): number => {
		return this.amplitude * math.sin(os.clock() * this.frequency + this.phase) * this.multiplier;
	};
}
