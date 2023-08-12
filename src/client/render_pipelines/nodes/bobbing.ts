import { Controller } from "@flamework/core";
import { Sine } from "shared/utilities/sine_utility";
import { Node } from "../node";
import { EquippedItem } from "client/types/items";
import { offsetFromPivot } from "shared/utilities/cframe_utility";
import { getCharacterSpeed, isCharacterGrounded } from "shared/utilities/character_utility";

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
		yaw: { amplitude: 0.01, frequency: Bobbing.frequency * 2 },
		pitch: { amplitude: 0.05, frequency: Bobbing.frequency * 2 },
		roll: { amplitude: 0.6, frequency: Bobbing.frequency },
		x: { amplitude: 0.6, frequency: Bobbing.frequency * 2 },
		y: { amplitude: 0.8, frequency: Bobbing.frequency * 2 },
		z: { amplitude: 0.8, frequency: Bobbing.frequency * 2 },
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

	preUpdate(deltaTime: number, character: Model): void {
		const characterSpeed = getCharacterSpeed(character);
		const isGrounded = isCharacterGrounded(character);

		const bobbingMultiplier = isGrounded === true ? characterSpeed : 0;

		for (const [axis, sine] of pairs(this.sines)) {
			sine.setAmplitude((this.sineValues[axis].amplitude * bobbingMultiplier) / 20);
			sine.setFrequency((this.sineValues[axis].frequency * bobbingMultiplier) / 11);
		}

		this.bobbingAmount = this.bobbingAmount.Lerp(
			new CFrame(0, this.sines.y.update(), -this.sines.z.update()).mul(CFrame.Angles(0, this.sines.pitch.update(), this.sines.roll.update())),
			5 * deltaTime,
		);
	}

	update(deltaTime: number, currentCFrame: CFrame, character: Model, equippedItem: EquippedItem): CFrame {
		return offsetFromPivot(currentCFrame, equippedItem.item.CenterPart.CFrame, this.bobbingAmount);
	}
}
