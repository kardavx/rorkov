import { Controller, OnStart, OnRender } from "@flamework/core";
import { OnCharacterAdded } from "./core";
import { Players, Workspace } from "@rbxts/services";
import { Input } from "./input";

interface ControlModule {
	Enable: (ControlModule: ControlModule, Enabled: boolean) => void;
}
export type MovementState = "walk" | "run";

@Controller({})
export class Movement implements OnCharacterAdded, OnStart, OnRender {
	static localPlayer = Players.LocalPlayer;
	static playerScripts = Movement.localPlayer.WaitForChild("PlayerScripts");
	static playerModule = Movement.playerScripts.WaitForChild("PlayerModule");
	static controlModule = require(Movement.playerModule.WaitForChild("ControlModule") as ModuleScript) as ControlModule;

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
	private humanoid: Humanoid | undefined = undefined;
	private humanoidRootPart: BasePart | undefined = undefined;

	private movementState: MovementState = "walk";

	static speedConstant = {
		crouch: 6,
		walk: 12,
		run: 23,
	};

	static forceConstant = {
		jump: 0,
	};

	static accelerationConstant = {
		crouch: 30,
		walk: 40,
		run: 50,
	};

	constructor(private input: Input) {}

	onCharacterAdded(character: Model) {
		this.humanoid = character.WaitForChild("Humanoid") as Humanoid;
		this.humanoidRootPart = character.WaitForChild("HumanoidRootPart") as BasePart;

		this.humanoid.WalkSpeed = 0;
	}

	onRender(dt: number): void {
		if (!this.humanoid || this.humanoid.Health === 0 || !this.humanoidRootPart) return;
		const input: Vector3 = this.moveVector;
		const currentVelocity = this.humanoidRootPart.AssemblyLinearVelocity.Magnitude;
		const desiredVelocity = currentVelocity + dt * (-1 + input.Magnitude * 2) * Movement.accelerationConstant[this.movementState];
		const limitedVelocity = math.clamp(desiredVelocity, 0, Movement.speedConstant[this.movementState]);

		this.humanoid.WalkSpeed = limitedVelocity;

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
			if (this.humanoid?.FloorMaterial === Enum.Material.Air) return;

			this.humanoid?.ChangeState(Enum.HumanoidStateType.Jumping);
			this.humanoidRootPart?.ApplyImpulse(new Vector3(0, Movement.forceConstant.jump, 0).mul(this.humanoidRootPart.AssemblyMass));
		},
		sprint: (inputState: boolean) => {
			this.movementState = inputState ? "run" : "walk";
		},
	};

	onStart(): void {
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

		Movement.controlModule.Enable(Movement.controlModule, false);
	}
}
