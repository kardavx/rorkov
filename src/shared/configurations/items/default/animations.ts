export type AnimationContents = {
	type: "Pose" | "Animation";
	id: number;
	looped?: boolean;
	weights?: [position: [x: number, y: number, z: number], rotation: [x: number, y: number, z: number]];
};

export interface Animations {
	[animationName: string]: AnimationContents;
}

export interface DefaultAnimations extends Animations {
	something: {
		type: "Pose";
		id: 14461014204;
	};
}

export interface WeaponAnimations extends DefaultAnimations {
	reload: {
		type: "Animation";
		id: 14461014204;
	};
}

export interface GrenadeAnimations extends DefaultAnimations {
	throw: {
		type: "Animation";
		id: 14461014204;
	};
}

export interface UseableAnimations extends DefaultAnimations {
	use: {
		type: "Animation";
		id: 14461014204;
	};
}

const globalDefaultAnimations: DefaultAnimations = {
	something: {
		type: "Pose",
		id: 14461014204,
	},
};

export const weaponDefaultAnimations: WeaponAnimations = {
	...globalDefaultAnimations,
	...{
		reload: {
			type: "Animation",
			id: 14461014204,
		},
	},
};

export const grenadeDefaultAnimations: GrenadeAnimations = {
	...globalDefaultAnimations,
	...{
		throw: {
			type: "Animation",
			id: 14461014204,
		},
	},
};

export const useableDefaultAnimations: UseableAnimations = {
	...globalDefaultAnimations,
	...{
		use: {
			type: "Animation",
			id: 14461014204,
		},
	},
};
