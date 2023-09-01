import { Controller, OnStart, OnTick } from "@flamework/core";
import { Camera, Modifier } from "./camera";
import { Input } from "./input";
import { UserInputService } from "@rbxts/services";
import { OnCharacterAdded } from "./core";

@Controller({})
export class Freelook implements OnStart, OnTick, OnCharacterAdded {
	static xAxisMax = 1;
	static yAxisMax = 1;

	private freelookModifier = Modifier.create("freelook", false, 2.5);
	private freelookActive = false;
	private freelookOffset = Vector2.zero;

	constructor(private input: Input, private camera: Camera) {}

	onStart(): void {
		this.input.bindAction("enableFreelook", Enum.UserInputType.MouseButton3, 1, (inputState: boolean) => {
			this.freelookActive = inputState;
			this.camera.setCameraLocked("freelook", this.freelookActive);
		});
	}

	onCharacterAdded(character: Model): void {
		this.freelookActive = false;
	}

	isFreelooking = (): boolean => this.freelookActive;

	onTick(dt: number): void {
		if (this.freelookActive) {
			const mouseDelta = UserInputService.GetMouseDelta().div(300);
			this.freelookOffset = this.freelookOffset.add(mouseDelta.mul(-1));
		} else {
			this.freelookOffset = this.freelookOffset.Lerp(Vector2.zero, 0.1);
		}

		this.freelookOffset = new Vector2(
			math.clamp(this.freelookOffset.X, -Freelook.xAxisMax, Freelook.xAxisMax),
			math.clamp(this.freelookOffset.Y, -Freelook.yAxisMax, Freelook.yAxisMax),
		);

		this.freelookModifier.setOffset(new CFrame(0, 0, 0).mul(CFrame.Angles(this.freelookOffset.Y, this.freelookOffset.X, 0)));
	}
}
