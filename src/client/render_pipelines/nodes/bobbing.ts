import { Controller } from "@flamework/core";
import { Sine } from "shared/utilities/sine_utility";
import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { offsetFromPivot } from "shared/utilities/cframe_utility";

type Sines = {
	[axis in string]: Sine;
};

type SineValues = {
	[axis in string]: {
		amplitude: number;
		frequency: number;
	};
};

@Controller({})
export class Bobbing implements Node {
	static frequency = 7;
	static amplitude = 1;

	private sineValues: SineValues = {
		yaw: { amplitude: 0.2, frequency: 14 },
		pitch: { amplitude: 0.05, frequency: 14 },
		roll: { amplitude: 0.5, frequency: 7 },
		x: { amplitude: 0.6, frequency: 14 },
		y: { amplitude: 0.6, frequency: 14 },
		z: { amplitude: 0.2, frequency: 14 },
	};

	private sines: Sines = {
		yaw: new Sine(this.sineValues.yaw.amplitude, this.sineValues.yaw.frequency, 1.56),
		pitch: new Sine(this.sineValues.pitch.amplitude, this.sineValues.pitch.frequency, 1.56),
		roll: new Sine(this.sineValues.roll.amplitude, this.sineValues.roll.frequency),
		x: new Sine(this.sineValues.x.amplitude, this.sineValues.x.frequency, 1.56),
		y: new Sine(this.sineValues.y.amplitude, this.sineValues.y.frequency, 1.56),
		z: new Sine(this.sineValues.z.amplitude, this.sineValues.z.frequency, 1.56),
	};

	private bobbingAmount: CFrame = new CFrame();

	preUpdate(deltaTime: number, playerVelocity: number, equippedItem: EquippedItem): void {
		for (const [axis, sine] of pairs(this.sines)) {
			sine.setAmplitude((this.sineValues[axis].amplitude * playerVelocity) / 15);
			sine.setFrequency((this.sineValues[axis].frequency * playerVelocity) / 15);
		}

		this.bobbingAmount = this.bobbingAmount.Lerp(
			new CFrame(this.sines.x.update(), this.sines.y.update(), -this.sines.z.update()).mul(
				CFrame.Angles(-this.sines.yaw.update(), this.sines.pitch.update(), this.sines.roll.update()),
			),
			5 * deltaTime,
		);
	}

	update(deltaTime: number, currentCFrame: CFrame, playerVelocity: number, equippedItem: EquippedItem): CFrame {
		return offsetFromPivot(currentCFrame, equippedItem.item.CenterPart.CFrame, this.bobbingAmount);
	}
}
