import { TweenService } from "@rbxts/services";
import { lerp } from "./utilities/number_utility";

export type AllowedTypes = number | CFrame | Vector2 | Vector3 | UDim2;
export type TypesWithDefaultLerp = CFrame | Vector2 | Vector3 | UDim2;

export default class Tween {
	private playing = false;
	private tweenedValue: typeof this.baseValue;

	constructor(private baseValue: AllowedTypes, private tweenInfo: TweenInfo, private target: typeof baseValue) {
		this.tweenedValue = baseValue;
	}

	play = () => {
		task.spawn(() => {
			let elapsed = 0;
			let alpha = 0;
			this.playing = true;

			while (alpha < 1) {
				if (!this.playing) {
					this.tweenedValue = this.baseValue;
					break;
				}

				alpha = math.clamp(elapsed / this.tweenInfo.Time, 0, 1);

				if (typeOf(this.baseValue) === "number") {
					this.tweenedValue = lerp(
						this.baseValue as number,
						this.target as number,
						TweenService.GetValue(alpha, this.tweenInfo.EasingStyle, this.tweenInfo.EasingDirection),
					);
				} else if (typeOf(this.baseValue) === "CFrame") {
					const a = this.baseValue as CFrame;
					this.tweenedValue = a.Lerp(this.target as CFrame, TweenService.GetValue(alpha, this.tweenInfo.EasingStyle, this.tweenInfo.EasingDirection));
				}

				elapsed += task.wait();
			}
		});
	};

	getTweened = (): typeof this.baseValue => {
		return this.tweenedValue;
	};
}
