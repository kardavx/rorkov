import { Controller, OnStart, OnTick } from "@flamework/core";
import { Modifier } from "./camera";
import { Input } from "./input";
import { UserInputService, Workspace } from "@rbxts/services";
import { OnCharacterAdded } from "./core";

@Controller({})
export class Freelook implements OnStart, OnTick, OnCharacterAdded {
	static xAxisMax = math.rad(45);
	static yAxisMax = math.rad(45);

	private freelookModifier = Modifier.create("freelook", false, 3);
	private isFreeloking = false;
	private freelookOffset = Vector2.zero;
	private camera = Workspace.CurrentCamera;

	private humanoid: Humanoid | undefined;
	private humanoidRootPart: BasePart | undefined;

	constructor(private input: Input) {}

	onStart(): void {
		this.input.bindAction(`enableFreelook`, Enum.UserInputType.MouseButton3, 1, (inputState: boolean) => {
			this.isFreeloking = inputState;
			this.humanoid!.AutoRotate = !inputState;
		});
	}

	onCharacterAdded(character: Model): void {
		this.isFreeloking = false;

		const humanoid = character.WaitForChild("Humanoid", 5) as Humanoid;
		const humanoidRootPart = character.WaitForChild("HumanoidRootPart", 5) as BasePart;
		this.humanoid = humanoid;
		this.humanoidRootPart = humanoidRootPart;
	}

	onTick(dt: number): void {
		/*
		if (this.isFreeloking) {
			const mouseDelta = UserInputService.GetMouseDelta().div(1000);
			this.freelookOffset = this.freelookOffset.add(mouseDelta.mul(-1));


		} else {
			this.freelookOffset = this.freelookOffset.Lerp(Vector2.zero, 0.1);
		}

		this.freelookOffset = new Vector2(
			math.clamp(this.freelookOffset.X, -Freelook.xAxisMax, Freelook.xAxisMax),
			math.clamp(this.freelookOffset.Y, -Freelook.yAxisMax, Freelook.yAxisMax),
		);
		*/

		if (this.isFreeloking) {
			const camCF = this.camera!.CFrame;
			const camRot = camCF.ToOrientation();

			let localCamRot = camCF.ToObjectSpace(this.humanoidRootPart!.CFrame).ToOrientation();
			localCamRot[1] = math.clamp(localCamRot[1], -Freelook.xAxisMax, Freelook.xAxisMax);
			localCamRot = CFrame.fromOrientation(localCamRot[0], localCamRot[1], localCamRot[2]).ToObjectSpace(this.humanoidRootPart!.CFrame).ToOrientation();

			this.camera!.CFrame = new CFrame(camCF.Position).mul(
				CFrame.fromOrientation(math.clamp(camRot[0], -Freelook.yAxisMax, Freelook.yAxisMax), localCamRot[1], camRot[2]),
			);
		}

		//print(this.freelookOffset);

		this.freelookModifier.setOffset(new CFrame());
	}
}
