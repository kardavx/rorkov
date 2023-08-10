import { Controller } from "@flamework/core";
import { OnPostCameraRender, OnCharacterAdded } from "./core";
import { Workspace } from "@rbxts/services";

type Modifiers = { [modifierName in string]: Modifier | undefined };

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
			this.offset.Lerp(new CFrame(), Modifier.dampenAmount * deltaTime);
		}
	};

	public destroy = (): void => {
		this.setOffset(new CFrame());
		Modifier.modifiers[this.name] = undefined;
		this.destroyed = true;
	};
}

@Controller({})
export class Camera implements OnPostCameraRender, OnCharacterAdded {
	static camera = Workspace.CurrentCamera;
	static baseOffset = new Vector3(0, 0, -1.5);
	private head: BasePart | undefined;
	private rootPart: BasePart | undefined;
	private humanoid: Humanoid | undefined;

	private applyPosition(summedOffset: CFrame) {
		const headCFrame = this.head!.CFrame;

		const cameraOffset = Camera.baseOffset.add(summedOffset.Position);
		const offsetInObjectSpace = this.rootPart!.CFrame.PointToObjectSpace(headCFrame.Position.add(cameraOffset));
		this.humanoid!.CameraOffset = offsetInObjectSpace;
	}
	private applyRotation(summedOffset: CFrame) {
		const [x, y, z] = summedOffset.ToOrientation();
		Camera.camera!.CFrame = Camera.camera!.CFrame.mul(CFrame.Angles(x, y, z));
	}

	onCharacterAdded(character: Model): void {
		this.head = character.WaitForChild("Head", 5) as BasePart;
		this.rootPart = character.WaitForChild("HumanoidRootPart", 5) as BasePart;
		this.humanoid = character.WaitForChild("Humanoid", 5) as Humanoid;
	}

	onPostCameraRender(deltaTime: number): void {
		if (!Camera.camera) return;

		Modifier.updateOffsets(deltaTime);

		const summedOffset = Modifier.getSummedOffsets();
		this.applyRotation(summedOffset);
		if (this.humanoid) this.applyPosition(summedOffset);
	}
}
