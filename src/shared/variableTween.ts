import { TweenService } from "@rbxts/services";
import { RunService } from "@rbxts/services";
import { lerp } from "./utilities/number_utility";
import { log } from "./log_message";

export type AllowedTypes = number | CFrame | Vector2 | Vector3 | UDim2;

interface Lerpable {
	Lerp(this: Lerpable, goal: this, alpha: number): AllowedTypes; //anything with Lerp on it
}

export default class Tween {
	static tweens: { [identificator: string]: Tween | undefined } = {};
	static create = (identificator: string, baseValue: AllowedTypes, tweenInfo: TweenInfo, target: typeof baseValue) => {
		if (Tween.tweens[identificator] !== undefined) {
			Tween.tweens[identificator]!.cancel();
		}

		Tween.tweens[identificator] = new Tween(baseValue, tweenInfo, target);
		return Tween.tweens[identificator] as Tween;
	};
	static destroy = (identificator: string) => {
		if (Tween.tweens[identificator] === undefined) {
			log("warning", `attempt to destroy a tween that doesn't exist (parsed identificator: ${identificator})`);
			return;
		}

		Tween.tweens[identificator]!.cancel();
		Tween.tweens[identificator] = undefined;
	};

	private playing = false;
	private isCancelled = false;
	private resetValueOnCancel = false;
	private tweenedValue: typeof this.baseValue;

	private constructor(private baseValue: AllowedTypes, private tweenInfo: TweenInfo, private target: typeof baseValue) {
		this.tweenedValue = baseValue;
	}

	play = (updateValue: (newValue: AllowedTypes) => void) => {
		if (this.playing) {
			log("warning", "Attempt to play a already playing tween");
			return;
		}

		if (this.isCancelled) {
			log("warning", "Attempt to play a cancelled tween");
		}

		task.spawn(() => {
			let elapsed = 0;
			let alpha = 0;
			this.playing = true;

			while (alpha < 1) {
				if (this.isCancelled) {
					if (this.resetValueOnCancel) this.tweenedValue = this.baseValue;
					this.playing = false;
					break;
				}

				alpha = math.clamp(elapsed / this.tweenInfo.Time, 0, 1);

				if (typeIs(this.baseValue, "number")) {
					this.tweenedValue = lerp(
						this.baseValue as number,
						this.target as number,
						TweenService.GetValue(alpha, this.tweenInfo.EasingStyle, this.tweenInfo.EasingDirection),
					);
				} else {
					const typedValue = this.baseValue as Lerpable;
					this.tweenedValue = typedValue.Lerp(
						this.target as Lerpable,
						TweenService.GetValue(alpha, this.tweenInfo.EasingStyle, this.tweenInfo.EasingDirection),
					);
				}

				updateValue(this.tweenedValue);

				elapsed += task.wait();
			}

			this.playing = false;
		});
	};

	cancel = (resetValue = false) => {
		this.resetValueOnCancel = resetValue;
		this.isCancelled = true;
	};

	wait = () => {
		if (!this.playing) return;
		while (this.playing) RunService.Heartbeat.Wait();
	};
}
