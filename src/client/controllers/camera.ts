import { Controller } from "@flamework/core";
import { OnPreCameraRender, OnPostCameraRender } from "./core";
import { OnCharacterAdded } from "./core";
import { Players, Workspace } from "@rbxts/services";
import { lerp } from "shared/utilities/number_utility";

type Modifiers = { [modifierName in string]: Modifier | undefined };
type FOVModifiers = { [modifierName in string]: FOVModifier | undefined };

export class Modifier {
	static modifiers: Modifiers = {};
	static dampenAmount = 5;

	static create = (name: string, isAutomaticallyDampened = false): Modifier => {
		if (!Modifier.modifiers[name]) Modifier.modifiers[name] = new Modifier(name, isAutomaticallyDampened);
		return Modifier.modifiers[name] as Modifier;
	};

	static getSummedOffsets = (): CFrame => {
		let finalOffset = new CFrame();

		for (const [_, modifierObject] of pairs(Modifier.modifiers)) {
			finalOffset = finalOffset.mul(modifierObject.getOffset());
		}

		return finalOffset;
	};

	static updateOffsets = (deltaTime: number): void => {
		for (const [_, modifierObject] of pairs(Modifier.modifiers)) {
			modifierObject.update(deltaTime);
		}
	};

	private offset: CFrame = new CFrame();
	private destroyed = false;

	private constructor(private name: string, private isAutomaticallyDampened: boolean) {}

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
			this.setOffset(this.getOffset().Lerp(new CFrame(), Modifier.dampenAmount * deltaTime));
		}
	};

	public destroy = (): void => {
		this.setOffset(new CFrame());
		Modifier.modifiers[this.name] = undefined;
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
export class Camera implements OnPreCameraRender, OnPostCameraRender, OnCharacterAdded {
	static camera = Workspace.CurrentCamera;
	static player = Players.LocalPlayer;
	static baseOffset = new Vector3(0, -0.5, -1.5);
	static baseFOV = 75;
	static baseLV = Vector3.zAxis;
	private head: BasePart | undefined;
	private rootPart: BasePart | undefined;
	private humanoid: Humanoid | undefined;

	private lastOffsets: CFrame = new CFrame();
	private rotationDelta: Vector2 = new Vector2();
	private lastCameraCFrame: CFrame | undefined;
	private rawCameraCFrame = Camera.camera!.CFrame;

	private applyPosition(summedOffset: CFrame) {
		const headCF = this.head!.CFrame;
		const hrpCF = this.rootPart!.CFrame;
		const offset = hrpCF.PointToObjectSpace(headCF.Position.add(new Vector3(0, -1.5, 0)));

		this.humanoid!.CameraOffset = offset.add(Camera.baseOffset.add(summedOffset.Position));
	}

	private applyRotation(summedOffset: CFrame) {
		const [x, y, z] = summedOffset.ToOrientation();
		Camera.camera!.CFrame = Camera.camera!.CFrame.mul(CFrame.Angles(x, y, z));
	}

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
		return this.rawCameraCFrame;
	}

	onCharacterAdded(character: Model): void {
		this.head = character.WaitForChild("Head", 5) as BasePart;
		this.rootPart = character.WaitForChild("HumanoidRootPart", 5) as BasePart;
		this.humanoid = character.WaitForChild("Humanoid", 5) as Humanoid;

		Camera.player.CameraMode = Enum.CameraMode.LockFirstPerson;
		this.applyFOV(true);
	}

	onPreCameraRender(): void {
		if (!Camera.camera) return;
		this.rawCameraCFrame = Camera.camera!.CFrame.mul(this.lastOffsets.Inverse());
	}

	onPostCameraRender(deltaTime: number): void {
		if (!Camera.camera) return;

		Camera.camera!.CFrame = this.rawCameraCFrame;

		Modifier.updateOffsets(deltaTime);
		const summedOffset = Modifier.getSummedOffsets();
		const fovDifference = FOVModifier.getSummedDifferences();

		this.applyRotation(summedOffset);
		if (this.humanoid) this.applyPosition(summedOffset);
		this.applyFOV(false, fovDifference);

		this.updateRotationDelta();

		this.lastOffsets = summedOffset;
	}
}
