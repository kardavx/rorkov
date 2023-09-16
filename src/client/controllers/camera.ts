import { Controller, OnStart } from "@flamework/core";
import { OnPreCameraRender, OnPostCameraRender, OnCameraRender } from "./core";
import { OnCharacterAdded } from "./core";
import { Players, UserInputService, Workspace } from "@rbxts/services";
import { inverseLerp, lerp } from "shared/utilities/number_utility";
import { log } from "shared/log_message";

const userGameSettings = UserSettings().GetService("UserGameSettings");

type Modifiers = { [modifierName in string]: Modifier | undefined };
type FOVModifiers = { [modifierName in string]: FOVModifier | undefined };
type SensitivityModifiers = { [modifierName in string]: SensitivityModifier | undefined };

export class Modifier {
	static modifiers: Modifiers = {};

	static create = (name: string, isAutomaticallyDampened = false, dampenAmount = 5): Modifier => {
		if (!Modifier.modifiers[name]) Modifier.modifiers[name] = new Modifier(name, isAutomaticallyDampened, dampenAmount);
		return Modifier.modifiers[name] as Modifier;
	};

	static getSummedOffsets = (): CFrame => {
		let finalOffset: CFrame | undefined;

		for (const [_, modifierObject] of pairs(Modifier.modifiers)) {
			if (!finalOffset) {
				finalOffset = modifierObject.getOffset();
				continue;
			}

			finalOffset = finalOffset.mul(modifierObject.getOffset());
		}

		return finalOffset || new CFrame();
	};

	static updateOffsets = (deltaTime: number): void => {
		for (const [_, modifierObject] of pairs(Modifier.modifiers)) {
			modifierObject.update(deltaTime);
		}
	};

	private offset: CFrame = new CFrame();
	private destroyed = false;

	private constructor(private name: string, private isAutomaticallyDampened: boolean, private dampenAmount: number) {}

	public getOffset = (): CFrame => {
		if (this.destroyed) throw `Attempt to get offset of modifier after it was destroyed`;

		return this.offset;
	};

	public setOffset = (newOffset: CFrame) => {
		if (this.destroyed) throw `Attempt to set offset of modifier after it was destroyed`;

		this.offset = newOffset;
	};

	public update = (deltaTime: number) => {
		if (this.destroyed) throw `Attempt to update modifier after it was destroyed`;

		if (this.isAutomaticallyDampened) {
			this.setOffset(this.getOffset().Lerp(new CFrame(), this.dampenAmount * deltaTime));
		}
	};

	public destroy = (): void => {
		this.setOffset(new CFrame());
		Modifier.modifiers[this.name] = undefined;
		this.destroyed = true;
	};
}

export class SensitivityModifier {
	static modifiers: SensitivityModifiers = {};

	static create = (name: string): SensitivityModifier => {
		if (!SensitivityModifier.modifiers[name]) SensitivityModifier.modifiers[name] = new SensitivityModifier(name);
		return SensitivityModifier.modifiers[name] as SensitivityModifier;
	};

	static getMultiplier = (): number => {
		let lowestPercentage = 100;

		for (const [_, modifierObject] of pairs(SensitivityModifier.modifiers)) {
			const modifierPercent = modifierObject.getPercent();
			if (modifierPercent < lowestPercentage) lowestPercentage = modifierPercent;
		}

		if (lowestPercentage > 100 || lowestPercentage < 0) throw `Incorrect percentage value!`;

		return lowestPercentage / 100;
	};

	private percent = 100;
	private destroyed = false;

	private constructor(private name: string) {}

	public getPercent = (): number => {
		if (this.destroyed) throw `Attempt to get percent of modifier after it was destroyed`;

		return this.percent;
	};

	public setPercent = (newPercent: number) => {
		if (this.destroyed) throw `Attempt to set percent of modifier after it was destroyed`;

		if (newPercent > 100 || newPercent < 0) {
			log("warning", `Attempt to set an incorrect percentage for modifier ${this.name}`);
			return;
		}

		this.percent = newPercent;
	};

	public destroy = (): void => {
		this.setPercent(0);
		SensitivityModifier.modifiers[this.name] = undefined;
		this.destroyed = true;
	};
}

export class FOVModifier {
	static modifiers: FOVModifiers = {};

	static create = (name: string): FOVModifier => {
		if (!FOVModifier.modifiers[name]) FOVModifier.modifiers[name] = new FOVModifier(name);
		return FOVModifier.modifiers[name] as FOVModifier;
	};

	static getSummedDifferences = (): number => {
		let finalDifference = 0;

		for (const [_, modifierObject] of pairs(FOVModifier.modifiers)) {
			finalDifference = finalDifference + modifierObject.getDifference();
		}

		return finalDifference;
	};

	private difference = 0;
	private destroyed = false;

	private constructor(private name: string) {}

	public getDifference = (): number => {
		if (this.destroyed) throw `Attempt to get difference of modifier after it was destroyed`;

		return this.difference;
	};

	public setDifference = (newDifference: number) => {
		if (this.destroyed) throw `Attempt to set difference of modifier after it was destroyed`;

		this.difference = newDifference;
	};

	public destroy = (): void => {
		this.setDifference(0);
		FOVModifier.modifiers[this.name] = undefined;
		this.destroyed = true;
	};
}

@Controller({})
export class Camera implements OnPreCameraRender, OnPostCameraRender, OnCameraRender, OnCharacterAdded, OnStart {
	static camera = Workspace.CurrentCamera;
	static player = Players.LocalPlayer;
	static baseOffset = new Vector3(0, 0, -1.5);
	static baseFOV = 75;
	static baseLV = Vector3.zAxis;
	private head: BasePart | undefined;
	private rootPart: BasePart | undefined;

	private lastOffsets: CFrame = new CFrame();
	private rotationDelta: Vector2 = new Vector2();
	private lastCameraCFrame: CFrame | undefined;
	private rawCameraCFrame: CFrame | undefined;
	private rotationAngles = { x: 0, y: 0 };

	private lockers: string[] = [];

	private updateRotationDelta() {
		if (this.lastCameraCFrame) {
			const currentCameraLV = Camera.camera!.CFrame.LookVector;
			const shouldInvert = Camera.baseLV.Dot(currentCameraLV) >= 0;
			const difference = currentCameraLV.sub(this.lastCameraCFrame.LookVector);
			this.rotationDelta = new Vector2(difference.X, difference.Y).mul(100).mul(shouldInvert ? new Vector2(-1, 1) : 1);
		}

		this.lastCameraCFrame = Camera.camera!.CFrame;
	}

	private applyFOV(instant = false, fovDifference = 0) {
		Camera.camera!.FieldOfView = lerp(Camera.camera!.FieldOfView, Camera.baseFOV + fovDifference, instant ? 1 : 0.075);
	}

	getRotationDelta(): Vector2 {
		return this.rotationDelta;
	}

	getRawCFrame(): CFrame {
		return Camera.camera!.CFrame.mul(this.lastOffsets.Inverse());
	}

	onCharacterAdded(character: Model): void {
		this.head = character.WaitForChild("Head", 5) as BasePart;
		this.rootPart = character.WaitForChild("HumanoidRootPart", 5) as BasePart;

		Camera.player.CameraMode = Enum.CameraMode.LockFirstPerson;
		Camera.camera!.CameraSubject = this.head;
		this.applyFOV(true);
	}

	isCameraLocked = () => this.lockers.size() > 0;

	setCameraLocked = (lockerID: string, lockState: boolean) => {
		if (lockState) {
			const lockerIndex = this.lockers.indexOf(lockerID);
			if (lockerIndex !== -1) {
				log("warning", "Tried to add a locker that is already applied");
				return;
			}

			this.lockers.push(lockerID);
		} else {
			const lockerIndex = this.lockers.indexOf(lockerID);
			if (lockerIndex === -1) {
				log("warning", "Tried to delete a locker that doesnt exist on array lockers");
				return;
			}

			this.lockers.remove(lockerIndex);
		}
	};

	onPreCameraRender(deltaTime: number): void {
		if (!Camera.camera) return;

		const cameraSubject = Camera.camera!.CameraSubject as BasePart;
		if (!cameraSubject || !cameraSubject.IsA("BasePart")) return;

		if (!this.isCameraLocked()) {
			const mouseDelta = UserInputService.GetMouseDelta().mul(100);
			const correctedMouseDelta = mouseDelta.mul(deltaTime);

			const mouseSensitivity = userGameSettings.MouseSensitivity;
			userGameSettings.RotationType = Enum.RotationType.CameraRelative;

			this.rotationAngles.x += math.rad(correctedMouseDelta.X * SensitivityModifier.getMultiplier() * mouseSensitivity * -1);
			this.rotationAngles.y += math.rad(correctedMouseDelta.Y * SensitivityModifier.getMultiplier() * mouseSensitivity * -1);
			this.rotationAngles.y = math.clamp(this.rotationAngles.y, math.rad(-75), math.rad(75));
		}

		Camera.camera.Focus = new CFrame(cameraSubject.CFrame.Position);
		this.rawCameraCFrame = new CFrame(cameraSubject.CFrame.mul(new CFrame(Camera.baseOffset)).Position).mul(
			CFrame.fromEulerAnglesYXZ(this.rotationAngles.y, this.rotationAngles.x, 0),
		);
	}

	onCameraRender(): void {
		if (!Camera.camera || !this.rawCameraCFrame) return;
		Camera.camera.CFrame = this.rawCameraCFrame;
		if (this.rootPart) {
			const lookVector = Camera.camera.CFrame.LookVector;
			this.rootPart.CFrame = CFrame.lookAt(
				this.rootPart.CFrame.Position,
				this.rootPart.CFrame.Position.add(new Vector3(lookVector.X, this.rootPart.CFrame.LookVector.Y, lookVector.Z)),
			);
		}
	}

	onPostCameraRender(deltaTime: number): void {
		if (!Camera.camera || !this.rawCameraCFrame) return;

		Modifier.updateOffsets(deltaTime);
		const summedOffset = Modifier.getSummedOffsets();
		const fovDifference = FOVModifier.getSummedDifferences();

		Camera.camera!.CFrame = Camera.camera!.CFrame.mul(summedOffset);
		this.applyFOV(false, fovDifference);

		this.updateRotationDelta();
		this.lastOffsets = summedOffset;
	}

	onStart(): void {
		Camera.camera!.CameraType = Enum.CameraType.Scriptable;
		UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
		UserInputService.MouseIconEnabled = false;
		Camera.camera!.GetPropertyChangedSignal("CameraType").Connect(() => {
			if (Camera.camera!.CameraType !== Enum.CameraType.Scriptable) Camera.camera!.CameraType = Enum.CameraType.Scriptable;
		});
		UserInputService.GetPropertyChangedSignal("MouseBehavior").Connect(() => {
			if (UserInputService.MouseBehavior !== Enum.MouseBehavior.LockCenter) UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
		});
	}
}
