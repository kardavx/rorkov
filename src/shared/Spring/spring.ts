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
	) {
		this.startTick = 0;
		this.f = f(this);
		this.reset();
	}

	private updateOffset = (): number => {
		const t: number = tick() - this.startTick;
		const f: DifEqFunctionTable = this.f;
		const offset: number = f.Offset(t);
		return offset;
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

	setExternalForce(force: number): void {
		this.update();
		this.ExternalForce = force;
		this.InitialOffset = this.offset - force / this.Constant;
		this.InitialVelocity = this.velocity;
		this.reset();
	}

	setGoal(goal: number): void {
		this.update();
		this.ExternalForce = goal * this.Constant;
		this.InitialOffset = this.offset - goal;
		this.InitialVelocity = this.velocity;
		this.reset();
	}

	addOffset(offset: number): void {
		this.update();
		this.InitialOffset = this.offset + offset;
		this.InitialVelocity = this.velocity;
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

	constructor(Mass: number, Damping: number, Constant: number, InitialOffset?: number, InitialVelocity?: number, ExternalForce?: number) {
		this.x = new NumberSpring(Mass, Damping, Constant, InitialOffset, InitialVelocity, ExternalForce);
		this.y = new NumberSpring(Mass, Damping, Constant, InitialOffset, InitialVelocity, ExternalForce);
		this.z = new NumberSpring(Mass, Damping, Constant, InitialOffset, InitialVelocity, ExternalForce);

		this.x.setGoal(0);
		this.y.setGoal(0);
		this.z.setGoal(0);
	}

	getOffset(): Vector3 {
		return new Vector3(this.x.getOffset(), this.y.getOffset(), this.z.getOffset());
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
