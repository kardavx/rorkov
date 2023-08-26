import { DifEqFunctionTable, f } from "./eq";

export interface SpringProperties {
	Offset: number;
	Velocity: number;
	Acceleration: number;
	Goal: number;
}

export interface SpringObject {
	Mass: number;
	Damping: number;
	Constant: number;
	InitialOffset: number;
	InitialVelocity: number;
	ExternalForce: number;
	startTick: number;
	advancedObjectStringEnabled: boolean;
	F: DifEqFunctionTable;
}

export class NumberSpring {
	public startTick: number;
	public f: DifEqFunctionTable;

	private offset = 0;
	private velocity = 0;

	constructor(
		public Mass: number,
		public Damping: number,
		public Constant: number,
		public InitialOffset: number = 0,
		public InitialVelocity: number = 0,
		public ExternalForce: number = 0,
		public Bounds?: NumberRange,
	) {
		this.startTick = 0;
		this.f = f(this);
		this.reset();
	}

	private updateOffset = (): number => {
		const t: number = tick() - this.startTick;
		const f: DifEqFunctionTable = this.f;
		const offset: number = f.Offset(t);
		return this.Bounds ? math.clamp(offset, this.Bounds.Min, this.Bounds.Max) : offset;
	};

	private updateVelocity = (): number => {
		const t: number = tick() - this.startTick;
		const f: DifEqFunctionTable = this.f;
		const velocity: number = f.Velocity(t);
		return velocity;
	};

	private update() {
		this.offset = this.updateOffset();
		this.velocity = this.updateVelocity();
	}

	reset(): void {
		this.f = f(this);
		this.startTick = tick();
	}

	setGoal(goal: number): void {
		this.update();
		this.ExternalForce = goal * this.Constant;
		this.InitialOffset = this.offset - goal;
		this.InitialVelocity = this.velocity;
		this.reset();
	}

	setOffset(offset: number): void {
		this.InitialOffset = offset;
		this.InitialVelocity = 0;
		this.reset();
	}

	getOffset(): number {
		this.update();
		return this.offset;
	}

	addVelocity(velocity: number): void {
		this.update();
		this.InitialOffset = this.offset;
		this.InitialVelocity = this.velocity + velocity;
		this.reset();
	}

	zero(): void {
		this.update();
		this.InitialOffset = 0;
		this.InitialVelocity = 0;
		this.reset();
	}
}

export class VectorSpring {
	private x: NumberSpring;
	private y: NumberSpring;
	private z: NumberSpring;

	constructor(
		Mass: number,
		Damping: number,
		Constant: number,
		InitialOffset?: number,
		InitialVelocity?: number,
		ExternalForce?: number,
		Bounds?: { x?: NumberRange; y?: NumberRange; z?: NumberRange },
	) {
		this.x = new NumberSpring(Mass, Damping, Constant, InitialOffset, InitialVelocity, ExternalForce, Bounds ? Bounds.x : undefined);
		this.y = new NumberSpring(Mass, Damping, Constant, InitialOffset, InitialVelocity, ExternalForce, Bounds ? Bounds.y : undefined);
		this.z = new NumberSpring(Mass, Damping, Constant, InitialOffset, InitialVelocity, ExternalForce, Bounds ? Bounds.z : undefined);

		this.x.setGoal(0);
		this.y.setGoal(0);
		this.z.setGoal(0);
	}

	getOffset(): Vector3 {
		return new Vector3(this.x.getOffset(), this.y.getOffset(), this.z.getOffset());
	}

	setOffset({ x, y, z }: { x?: number; y?: number; z?: number }) {
		if (x !== undefined) this.x.setOffset(x);
		if (y !== undefined) this.x.setOffset(y);
		if (z !== undefined) this.x.setOffset(z);
	}

	impulse(impulse: Vector3) {
		this.x.addVelocity(impulse.X);
		this.y.addVelocity(impulse.Y);
		this.z.addVelocity(impulse.Z);
	}

	reset(): void {
		this.x.reset();
		this.y.reset();
		this.z.reset();
	}

	zero(): void {
		this.x.zero();
		this.y.zero();
		this.z.zero();
	}
}
