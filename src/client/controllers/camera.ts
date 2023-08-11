import { Controller } from "@flamework/core";
import { OnPreCameraRender, OnPostCameraRender } from "./core";
import { OnCharacterAdded } from "./core";
import { Workspace } from "@rbxts/services";
import { offsetFromPivot } from "shared/utilities/cframe_utility";

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
			this.setOffset(this.getOffset().Lerp(new CFrame(), Modifier.dampenAmount * deltaTime));
		}
	};

	public destroy = (): void => {
		this.setOffset(new CFrame());
		Modifier.modifiers[this.name] = undefined;
		this.destroyed = true;
	};
}

@Controller({})
export class Camera implements OnPreCameraRender, OnPostCameraRender, OnCharacterAdded {
	static camera = Workspace.CurrentCamera;
	static baseOffset = new Vector3(0, 0, -0.5);
	private head: BasePart | undefined;
	private rootPart: BasePart | undefined;
	private humanoid: Humanoid | undefined;

	private lastOffsets: CFrame = new CFrame();

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

	onCharacterAdded(character: Model): void {
		this.head = character.WaitForChild("Head", 5) as BasePart;
		this.rootPart = character.WaitForChild("HumanoidRootPart", 5) as BasePart;
		this.humanoid = character.WaitForChild("Humanoid", 5) as Humanoid;
	}

	onPreCameraRender(): void {
		if (!Camera.camera) return;
		Camera.camera!.CFrame = Camera.camera!.CFrame.mul(this.lastOffsets.Inverse());

		const part = Workspace.WaitForChild("Part") as BasePart;
		const pivot = Workspace.WaitForChild("Pivot") as BasePart;

		part.CFrame = offsetFromPivot(part.CFrame, pivot.CFrame, CFrame.Angles(0, 0, math.rad(40)));
	}

	onPostCameraRender(deltaTime: number): void {
		if (!Camera.camera) return;

		Modifier.updateOffsets(deltaTime);
		const summedOffset = Modifier.getSummedOffsets();

		this.applyRotation(summedOffset);
		if (this.humanoid) this.applyPosition(summedOffset);

		this.lastOffsets = summedOffset;
	}
}
