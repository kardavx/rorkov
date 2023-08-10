import { Controller, OnRender } from "@flamework/core";
import { OnCharacterAdded } from "./core";
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
		if (this.destroyed)
			if (this.isAutomaticallyDampened) {
				this.setOffset(this.getOffset().Lerp(new CFrame(), 0.5));
			}
	};

	public destroy = (): void => {
		this.setOffset(new CFrame());
		Modifier.modifiers[this.name] = undefined;
		this.destroyed = true;
	};
}

@Controller({})
export class Camera implements OnRender, OnCharacterAdded {
	static camera = Workspace.CurrentCamera;
	static baseOffset = new Vector3(0, 0, -1.5);
	private head: BasePart | undefined;
	private rootPart: BasePart | undefined;
	private humanoid: Humanoid | undefined;

	private lastOffsets: CFrame = new CFrame();

	/* 
	XXXXXXXXXXXXXXXXXX 	XXXXXXXXXXXXXXXXXX       XXXXXX       XXXXXXXXXXXX      	XXXX	  XXXXXXXXXXXXXXXXXX
	XXXXXXXXXXXXXXXXXX  XXXXXXXXXXXXXXXXXX    XXXXX  XXXXX    XXXXXXXXXXXXX      XXXXXXXXXX   XXXXXXXXXXXXXXXXXX
		 XXXXXXXX       XXXX				 XXXXX    XXXXX   XXXXX     XXXXXX  XXXX    XXXX       XXXXXXXX
		 XXXXXXXX 		XXXXXXXXXXXXXXXXXX 	 XXXXXXXXXXXXXX   XXXXX     XXXXXX  XXXX    XXXX       XXXXXXXX
		 XXXXXXXX 		XXXXXXXXXXXXXXXXXX  XXXXXXXXXXXXXXXX  XXXXXXXXXXXXX     XXXX    XXXX       XXXXXXXX
		 XXXXXXXX       XXXX			    XXXXX      XXXXX  XXXXXXXX          XXXX    XXXX       XXXXXXXX
		 XXXXXXXX       XXXXXXXXXXXXXXXXXX  XXXXX      XXXXX  XXXXX              XXXXXXXXXX        XXXXXXXX
		 XXXXXXXX       XXXXXXXXXXXXXXXXXX  XXXXX      XXXXX  XXXXX             	XXXX           XXXXXXXX
	*/

	private applyPosition(summedOffset: CFrame) {
		const headCF = this.head!.CFrame;
		const hrpCF = this.rootPart!.CFrame;
		const offset = hrpCF.PointToObjectSpace(headCF.Position.add(new Vector3(0, -1, 0)));

		this.humanoid!.CameraOffset = Camera.baseOffset.add(offset);
	}

	private applyRotation(summedOffset: CFrame) {
		Camera.camera!.CFrame = Camera.camera!.CFrame.mul(summedOffset);
		// const [x, y, z] = summedOffset.ToOrientation();
		// Camera.camera!.CFrame = Camera.camera!.CFrame.mul(CFrame.Angles(x, y, z));
	}

	onCharacterAdded(character: Model): void {
		this.head = character.WaitForChild("Head", 5) as BasePart;
		this.rootPart = character.WaitForChild("HumanoidRootPart", 5) as BasePart;
		this.humanoid = character.WaitForChild("Humanoid", 5) as Humanoid;
	}

	onRender(deltaTime: number): void {
		if (!Camera.camera) return;

		const summedOffset = Modifier.getSummedOffsets();
		print(this.lastOffsets.Inverse().mul(summedOffset));
		this.applyRotation(this.lastOffsets.Inverse().mul(summedOffset));

		this.lastOffsets = summedOffset;
		Modifier.updateOffsets(deltaTime);
		// if (this.humanoid) this.applyPosition(summedOffset);
	}
}
