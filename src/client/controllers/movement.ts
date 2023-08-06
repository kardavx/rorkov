import { Controller, OnInit, OnStart, OnRender } from "@flamework/core";
import { Players, Workspace } from "@rbxts/services";
import { UserInputService } from "@rbxts/services";
import { Input } from "./input";

interface ControlModule {
	Enable: (ControlModule: ControlModule, Enabled: boolean) => void;
}

@Controller({})
export class Movement implements OnInit, OnStart, OnRender {
	static localPlayer = Players.LocalPlayer;
	static playerScripts = Movement.localPlayer.WaitForChild("PlayerScripts");
	static PlayerModule = Movement.playerScripts.WaitForChild("PlayerModule");
	static controlModule = require(Movement.PlayerModule.WaitForChild(
		"ControlModule",
	) as ModuleScript) as ControlModule;

	static inputMap = new Map<Enum.KeyCode, Vector3>([
		[Enum.KeyCode.W, new Vector3(0, 0, -1)],
		[Enum.KeyCode.S, new Vector3(0, 0, 1)],
		[Enum.KeyCode.A, new Vector3(-1, 0, 0)],
		[Enum.KeyCode.D, new Vector3(1, 0, 0)],
	]);

	private camera: Camera = Workspace.CurrentCamera as Camera;
	private moveVector: Vector3 = Vector3.zero;
	private humanoid: Humanoid | undefined = undefined;
	private humanoidRootPart: BasePart | undefined = undefined;

	private crouchSpeed = 6;
	private walkingSpeed = 12;
	private runningSpeed = 23;
	private crouchAcceleration = 30;
	private walkingAcceleration = 40;

	private speedConstant = {
		crouch: 6,
		walk: 12,
		run: 23,
	};

	private accelerationConstant = {
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
		const desiredVelocity = currentVelocity + dt * (-1 + input.Magnitude * 2) * this.accelerationConstant.walk;
		const limitedVelocity = math.clamp(desiredVelocity, 0, this.speedConstant.walk);

		this.humanoid.WalkSpeed = limitedVelocity;

		if (input.Magnitude <= 0) return;
		const y = this.camera.CFrame.ToOrientation()[1];
		const cameraOrientation = CFrame.Angles(0, y, 0);
		const forwardPoint = cameraOrientation.mul(new CFrame(input));
		const orientation = new CFrame(Vector3.zero, forwardPoint.Position);
		this.humanoid.Move(orientation.LookVector);
	}

	onInit(): void {
		if (Movement.localPlayer.Character) this.onCharacterAdded(Movement.localPlayer.Character);
		Movement.localPlayer.CharacterAdded.Connect((character: Model) => this.onCharacterAdded(character));
	}

	onStart(): void {
		Movement.inputMap.forEach((keyCodeVector: Vector3, keyCode: Enum.KeyCode) => {
			this.input.bindInput(
				"movement",
				keyCode.Name,
				(inputState: boolean) => {
					print(keyCode.Name, inputState, this.moveVector);
					this.moveVector = inputState
						? this.moveVector.add(keyCodeVector)
						: this.moveVector.sub(keyCodeVector);
				},
				keyCode,
			);
		});

		Movement.controlModule.Enable(Movement.controlModule, false);
	}
}
