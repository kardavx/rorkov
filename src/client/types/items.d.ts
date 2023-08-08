import { Spring } from "shared/math_utility";

type InventoryBinds = Enum.KeyCode[];
type Sights = Sight[];

interface Viewmodel extends Model {
	UpperTorso: BasePart;
	HumanoidRootPart: BasePart;
	CameraBone: BasePart;
	AnimationController: AnimationController & {
		Animator: Animator;
	};
}

interface ViewmodelWithItem extends Viewmodel {
	item: Item;
}

interface SightElements extends Model {
	ScopedIn: Model;
	ScopedOut: Model;
}

interface Sight extends Model {
	AimPart: BasePart;
	Elements: SightElements;
	Projector?: BasePart;
}

interface Item extends Model {
	Grip: BasePart;
	Sights?: Sights;
	Muzzle?: BasePart;
}

type Springs = {
	[springName in string]: Spring;
};

interface UpdatedSprings {
	[springName: string]: Vector3;
}

interface Alphas {
	[alphaName: string]: number;
}

interface Offsets {
	[offsetName: string]: Vector3 | number;
}

interface EquippedItem {
	viewmodel: ViewmodelWithItem;
	item: Item;
	alphas: Alphas;
	offsets: Offsets;
}
