import { Controller } from "@flamework/core";
import { OnPreCameraRender, OnPostCameraRender } from "./core";
import { OnCharacterAdded } from "./core";
import { Workspace } from "@rbxts/services";
import { offsetFromPivot } from "shared/utilities/cframe_utility";

type Modifiers = { [modifierName in string]: Modifier | undefined };

/**
 * Class responsible for modifying camera offset
 * @class Modifier
 * @author Kardavx
 */
export class Modifier {
	static modifiers: Modifiers = {};
	static dampenAmount = 5;

	/**
	 * Returns a modifier with given name, creating one if it doesn't exist
	 * @static
	 * @author Kardavx
	 * @param {string} name - name of the modifier
	 * @param {boolean} [isAutomaticallyDampened=false] - whether newly created modifier should be automatically dampened
	 * @returns {Modifier} {@link Modifier} - a modifier with given name
	 */
	static create = (name: string, isAutomaticallyDampened = false): Modifier => {
		if (!Modifier.modifiers[name]) Modifier.modifiers[name] = new Modifier(name, isAutomaticallyDampened);
		return Modifier.modifiers[name] as Modifier;
	};

	/**
	 * Gets final offset after applying all {@link Modifier}
	 * @static
	 * @author Kardavx
	 * @returns {CFrame} CFrame - final offset
	 */
	static getSummedOffsets = (): CFrame => {
		let finalOffset = new CFrame();

		for (const [_, modifierObject] of pairs(Modifier.modifiers)) {
			finalOffset = finalOffset.mul(modifierObject.getOffset());
		}

		return finalOffset;
	};

	/**
	 * Updates all existing modifiers
	 * @static
	 * @author Kardavx
	 * @param {number} deltaTime - delta between frames
	 * @returns {void}
	 */
	static updateOffsets = (deltaTime: number): void => {
		for (const [_, modifierObject] of pairs(Modifier.modifiers)) {
			modifierObject.update(deltaTime);
		}
	};

	private offset: CFrame = new CFrame();
	private destroyed = false;

	private constructor(private name: string, private isAutomaticallyDampened: boolean) {}

	/**
	 * Gets current {@link Modifier} offset
	 * @public
	 * @author Kardavx
	 * @returns {CFrame} CFrame - current {@link Modifier} offset
	 */
	public getOffset = (): CFrame => {
		if (this.destroyed) throw `Attempt to get offset of modifier after it was destroyed`;

		return this.offset;
	};

	/**
	 * Sets {@link Modifier} offset to given CFrame
	 * @public
	 * @author Kardavx
	 * @param {CFrame} newOffset - CFrame to set {@link Modifier} offset to
	 */
	public setOffset = (newOffset: CFrame) => {
		if (this.destroyed) throw `Attempt to set offset of modifier after it was destroyed`;

		this.offset = newOffset;
	};

	/**
	 * Updates {@link Modifier} offset when `isAutomaticallyDampened` is set to `true`
	 * @public
	 * @author Kardavx
	 * @param {number} deltaTime - delta between frames
	 * @returns {void}
	 */
	public update = (deltaTime: number) => {
		if (this.destroyed) throw `Attempt to update modifier after it was destroyed`;

		if (this.isAutomaticallyDampened) {
			this.setOffset(this.getOffset().Lerp(new CFrame(), Modifier.dampenAmount * deltaTime));
		}
	};

	/**
	 * Destroys the {@link Modifier}
	 * @public
	 * @author Kardavx
	 * @returns {void}
	 */
	public destroy = (): void => {
		this.setOffset(new CFrame());
		Modifier.modifiers[this.name] = undefined;
		this.destroyed = true;
	};
}

@Controller({})
/**
 * Controller responsible for player's camera
 * @class Camera
 * @author Kardavx
 * @implements {OnPreCameraRender}
 * @implements {OnPostCameraRender}
 * @implements {OnCharacterAdded}
 */
export class Camera implements OnPreCameraRender, OnPostCameraRender, OnCharacterAdded {
	static camera = Workspace.CurrentCamera;
	static baseOffset = new Vector3(0, 0, -0.5);
	private head: BasePart | undefined;
	private rootPart: BasePart | undefined;
	private humanoid: Humanoid | undefined;

	private lastOffsets: CFrame = new CFrame();

	/**
	 * Sets Camera CFrame to Character's Head CFrame offseted by Vector3(0, -1.5, 0) + given offset
	 * @private
	 * @author Kardavx
	 * @param {CFrame} summedOffset - additional offset to set Camera's CFrame to
	 * @returns {void}
	 */
	private applyPosition(summedOffset: CFrame): void {
		const headCF = this.head!.CFrame;
		const hrpCF = this.rootPart!.CFrame;
		const offset = hrpCF.PointToObjectSpace(headCF.Position.add(new Vector3(0, -1.5, 0)));

		this.humanoid!.CameraOffset = offset.add(Camera.baseOffset.add(summedOffset.Position));
	}

	/**
	 * Applies given rotation to Camera's CFrame
	 * @private
	 * @author Kardavx
	 * @param {CFrame} summedOffset - rotation to apply to Camera's CFrame
	 * @returns {void}
	 */
	private applyRotation(summedOffset: CFrame): void {
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
