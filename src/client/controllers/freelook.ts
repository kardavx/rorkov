import { Controller, OnStart, OnTick } from "@flamework/core";
import { Modifier } from "./camera";
import { Input } from "./input";
import { UserInputService } from "@rbxts/services";
import { OnCharacterAdded } from "./core";

@Controller({})
export class Freelook implements OnStart, OnTick, OnCharacterAdded {
	static xAxisMax = 1;
	static yAxisMax = 1;

	private freelookModifier = Modifier.create("freelook", false, 3);
	private isFreeloking = false;
	private freelookOffset = Vector2.zero;

	private humanoid: Humanoid | undefined;

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
		this.humanoid = humanoid;
	}

	onTick(dt: number): void {
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

		print(this.freelookOffset);

		this.freelookModifier.setOffset(
			new CFrame(0, this.freelookOffset.X / 2, this.freelookOffset.X / 4).mul(CFrame.Angles(this.freelookOffset.Y, this.freelookOffset.X, 0)),
		);
	}
}
