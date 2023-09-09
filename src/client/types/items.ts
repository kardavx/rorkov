import { VectorSpring } from "shared/Spring/spring";
import State from "shared/state";
import { ItemConfig } from "shared/configurations/items";

export type Actions = Map<Enum.KeyCode, (inputState: boolean) => void>;

export interface Viewmodel extends Model {
	Torso: BasePart & {
		GunJoint: Motor6D;
		CameraBone: Motor6D;
	};
	"Left Arm": BasePart;
	"Right Arm": BasePart;
	CameraBone: BasePart;
	AnimationController: AnimationController & {
		Animator: Animator;
	};
}

export interface ViewmodelWithItem extends Viewmodel {
	item: Item;
}

export interface SightElements extends Model {
	ScopedIn: Model;
	ScopedOut: Model;
}

export interface Sight extends Model {
	AimPart: BasePart;
	Elements: SightElements;
	Projector?: BasePart & {
		Container: SurfaceGui;
	};
}

export interface Item extends Model {
	Grip: BasePart & {
		Slide?: Motor6D;
	};
	Sights?: Model & Sight[];
	CenterPart: BasePart;
	Muzzle?: BasePart;
}

export type Springs = {
	[springName in string]: VectorSpring;
};

export type UpdatedSprings = {
	[springName in string]: Vector3;
};

export interface Alphas {
	[alphaName: string]: number;
}

export interface Offsets {
	[offsetName: string]: Vector3 | number;
}

export interface EquippedItem {
	viewmodel: ViewmodelWithItem;
	item: Item;
	alphas: Alphas;
	offsets: Offsets;
	springs: Springs;
	state: State;
	configuration: ItemConfig;
	slide: {
		targetSlideOffset: Vector3;
		currentSlideOffset: Vector3;
	};
	runWithJumpOffset: boolean;
	blockingStates: string[];
}
