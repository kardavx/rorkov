import { Controller, OnStart, OnRender, OnTick, Modding } from "@flamework/core";
import { OnCharacterAdded } from "./core";
import { Players, Workspace } from "@rbxts/services";
import { Input } from "./input";
import { isCharacterGrounded } from "shared/utilities/character_utility";
import State from "shared/state";
import { setTimeout } from "@rbxts/set-timeout";

interface ControlModule {
	Enable: (ControlModule: ControlModule, Enabled: boolean) => void;
}
export type MovementState = "walk" | "run";

export interface OnJump {
	onJump(wasRunning: boolean): void;
}

export interface OnLand {
	onLand(fallTime: number): void;
}

export interface OnFallChanged {
	onFallChanged(state: boolean): void;
}

export interface OnRunningChanged {
	onRunningChanged(runningState: boolean): void;
}

export interface OnWalkingChanged {
	onWalkingChanged(runningState: boolean): void;
}

@Controller({})
export class Movement implements OnCharacterAdded, OnStart, OnRender, OnTick {
	static localPlayer = Players.LocalPlayer;
	static playerScripts = Movement.localPlayer.WaitForChild("PlayerScripts");
	static playerModule = Movement.playerScripts.WaitForChild("PlayerModule");
	static controlModule = require(Movement.playerModule.WaitForChild("ControlModule") as ModuleScript) as ControlModule;
	static states = ["Jumping", "Walking", "Running", "RunningRequest"];

	static inputMap = new Map<Enum.KeyCode, Vector3>([
		[Enum.KeyCode.W, new Vector3(0, 0, -1)],
		[Enum.KeyCode.S, new Vector3(0, 0, 1)],
		[Enum.KeyCode.A, new Vector3(-1, 0, 0)],
		[Enum.KeyCode.D, new Vector3(1, 0, 0)],
	]);

	static keyBinds = new Map<Enum.KeyCode, string>([
		[Enum.KeyCode.Space, "jump"],
		[Enum.KeyCode.LeftShift, "sprint"],
	]);

	private camera: Camera = Workspace.CurrentCamera as Camera;
	private moveVector: Vector3 = Vector3.zero;
	private lastMoveVector: Vector3 = this.moveVector;
	private lastVelocity = 0;
	private character: Model | undefined;
	private humanoid: Humanoid | undefined;
	private humanoidRootPart: BasePart | undefined;
	private state: State = new State(Movement.states);
	private slowDown = false;
	private clearSlowDown: (() => void) | undefined;
	private landListeners = new Set<OnLand>();
	private jumpListeners = new Set<OnJump>();
	private fallChangedListeners = new Set<OnFallChanged>();
	private lastFreefallStartTick: number | undefined;

	static speedConstant = {
		crouch: 6,
		walk: 12,
		run: 23,
	};

	static forceConstant = {
		jump: { up: 250, directional: 4 },
	};

	static accelerationConstant = {
		crouch: 30,
		walk: 40,
		run: 50,
	};

	constructor(private input: Input) {}

	onCharacterAdded(character: Model) {
		this.character = character;
		this.humanoid = character.WaitForChild("Humanoid") as Humanoid;
		this.humanoidRootPart = character.WaitForChild("HumanoidRootPart") as BasePart;

		if (this.humanoid) {
			this.humanoid.WalkSpeed = 0;
			this.humanoid.JumpPower = 0;

			this.humanoid.GetPropertyChangedSignal("JumpPower").Connect(() => {
				this.humanoid!.JumpPower = 0;
			});

			this.humanoid.StateChanged.Connect((oldValue: Enum.HumanoidStateType, newValue: Enum.HumanoidStateType) => {
				if (newValue === Enum.HumanoidStateType.FallingDown) {
					this.lastFreefallStartTick = os.clock();
					for (const listener of this.fallChangedListeners) {
						task.spawn(() => listener.onFallChanged(true));
					}
				}

				if (newValue === Enum.HumanoidStateType.Landed) {
					const fallTime = this.lastFreefallStartTick !== undefined ? os.clock() - this.lastFreefallStartTick : 0;
					for (const listener of this.landListeners) {
						task.spawn(() => listener.onLand(fallTime));
					}
				}

				if (oldValue === Enum.HumanoidStateType.FallingDown) {
					this.lastFreefallStartTick = undefined;
					for (const listener of this.fallChangedListeners) {
						task.spawn(() => listener.onFallChanged(false));
					}
				}
			});
		}
	}

	onTick(): void {
		if (!this.character || !this.humanoidRootPart) return;

		const currentVelocity = this.humanoidRootPart.AssemblyLinearVelocity.Magnitude;

		if (this.moveVector.Magnitude === 0 || !isCharacterGrounded(this.character) || this.state.isStateActive("Jumping")) {
			if (!this.state.isStateActive("Walking")) this.state.activateState("Walking");
		} else if (this.state.isStateActive("Walking")) this.state.disableState("Walking");

		if (this.state.isStateActive("RunningRequest") && this.moveVector.Z === -1 && currentVelocity > 5 && isCharacterGrounded(this.character)) {
			if (!this.state.isStateActive("Running")) this.state.activateState("Running");
		} else {
			if (this.state.isStateActive("Running")) this.state.disableState("Running");
		}
	}

	onRender(dt: number): void {
		if (!this.humanoid || !this.character || this.humanoid.Health === 0 || !this.humanoidRootPart) return;

		if (!isCharacterGrounded(this.character) || this.state.isStateActive("Jumping")) return;

		if (this.lastMoveVector !== this.moveVector) {
			if (this.lastMoveVector.add(this.moveVector).Magnitude === 0 && this.lastVelocity > 1) {
				if (this.clearSlowDown) {
					this.clearSlowDown();
				}
				this.slowDown = true;
				this.clearSlowDown = setTimeout(() => (this.slowDown = false), 0.2);
			}
		}

		const movementState = this.state.isStateActive("Running") ? "run" : "walk";
		const input: Vector3 = this.moveVector;
		const currentVelocity = this.humanoidRootPart.AssemblyLinearVelocity.Magnitude;
		const desiredVelocity = currentVelocity + dt * (-1 + input.Magnitude * 2) * Movement.accelerationConstant[movementState];
		const limitedVelocity = math.clamp(this.slowDown ? desiredVelocity / 2.5 : desiredVelocity, 0, Movement.speedConstant[movementState]);

		this.humanoid.WalkSpeed = limitedVelocity;
		this.lastVelocity = limitedVelocity;
		this.lastMoveVector = this.moveVector;

		if (input.Magnitude <= 0) return;
		const y = this.camera.CFrame.ToOrientation()[1];
		const cameraOrientation = CFrame.Angles(0, y, 0);
		const forwardPoint = cameraOrientation.mul(new CFrame(input));
		const orientation = new CFrame(Vector3.zero, forwardPoint.Position);
		this.humanoid.Move(orientation.LookVector);
	}

	private abilities = {
		jump: (inputState: boolean) => {
			if (!inputState) return;
			if (!this.character || !this.humanoid || !this.humanoidRootPart || !isCharacterGrounded(this.character) || this.state.isStateActive("Jumping"))
				return;

			this.state.activateState("Jumping");

			this.humanoid.WalkSpeed = this.moveVector.mul(
				Movement.forceConstant.jump.directional * (this.humanoidRootPart.AssemblyLinearVelocity.Magnitude / 3),
			).Magnitude;

			this.humanoidRootPart!.ApplyImpulse(
				this.moveVector
					.add(new Vector3(0, Movement.forceConstant.jump.up, 0))
					.mul(new Vector3(this.humanoidRootPart.AssemblyLinearVelocity.Magnitude, 1, this.humanoidRootPart!.AssemblyLinearVelocity.Magnitude)),
			);

			task.delay(1, () => this.state.disableState("Jumping"));
		},
		sprint: (inputState: boolean) => {
			if (inputState) {
				this.state.activateState("RunningRequest");
			} else {
				this.state.disableState("RunningRequest");
			}
		},
	};

	getRawMoveVector() {
		return this.moveVector;
	}

	getMoveVector(): Vector3 {
		return this.character && isCharacterGrounded(this.character) ? this.getRawMoveVector() : Vector3.zero;
	}

	isWalking(): boolean {
		return this.state.isStateActive("Walking");
	}

	isFalling(): boolean {
		if (!this.humanoid) return false;
		return this.humanoid.GetStateEnabled("FallingDown");
	}

	onStart(): void {
		const runningChangedListeners = new Set<OnRunningChanged>();
		const walkingChangedListeners = new Set<OnWalkingChanged>();

		Modding.onListenerAdded<OnJump>((object) => this.jumpListeners.add(object));
		Modding.onListenerRemoved<OnJump>((object) => this.jumpListeners.delete(object));
		Modding.onListenerAdded<OnRunningChanged>((object) => runningChangedListeners.add(object));
		Modding.onListenerRemoved<OnRunningChanged>((object) => runningChangedListeners.delete(object));
		Modding.onListenerAdded<OnWalkingChanged>((object) => walkingChangedListeners.add(object));
		Modding.onListenerRemoved<OnWalkingChanged>((object) => walkingChangedListeners.delete(object));
		Modding.onListenerAdded<OnLand>((object) => this.landListeners.add(object));
		Modding.onListenerRemoved<OnLand>((object) => this.landListeners.delete(object));
		Modding.onListenerAdded<OnFallChanged>((object) => this.fallChangedListeners.add(object));
		Modding.onListenerRemoved<OnFallChanged>((object) => this.fallChangedListeners.delete(object));

		Movement.inputMap.forEach((keyCodeVector: Vector3, keyCode: Enum.KeyCode) => {
			this.input.bindAction(`movement${keyCode.Name}`, keyCode, 2, (inputState: boolean) => {
				this.moveVector = inputState ? this.moveVector.add(keyCodeVector) : this.moveVector.sub(keyCodeVector);
			});
		});

		Movement.keyBinds.forEach((ability: string, keyCode: Enum.KeyCode) => {
			this.input.bindAction(`movement${keyCode.Name}`, keyCode, 2, (inputState: boolean) => {
				this.abilities[ability as keyof typeof this.abilities](inputState);
			});
		});

		this.state.bindToStateChanged("Jumping", (state: boolean) => {
			if (!state) return;

			for (const listener of this.jumpListeners) {
				task.spawn(() => listener.onJump(this.state.isStateActive("Running")));
			}

			this.humanoid!.ChangeState(Enum.HumanoidStateType.Jumping);
		});

		this.state.bindToStateChanged("Walking", (state: boolean) => {
			print("asdasdasd");
			for (const listener of walkingChangedListeners) {
				task.spawn(() => listener.onWalkingChanged(state));
			}
		});

		this.state.bindToStateChanged("Running", (state: boolean) => {
			print("asdasdasd");
			for (const listener of runningChangedListeners) {
				task.spawn(() => listener.onRunningChanged(state));
			}
		});

		Movement.controlModule.Enable(Movement.controlModule, false);
	}
}
