import { Spring } from "shared/math_utility";

export type InventoryBinds = Enum.KeyCode[];
export type Sights = Sight[];

export interface Viewmodel extends Model {
	UpperTorso: BasePart;
	HumanoidRootPart: BasePart;
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
	Projector?: BasePart;
}

export interface Item extends Model {
	Grip: BasePart;
	Sights?: Sights;
	Muzzle?: BasePart;
}

export type Springs = {
	[springName in string]: Spring;
};

export interface UpdatedSprings {
	[springName: string]: Vector3;
}

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
}
