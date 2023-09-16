export type AnimationContents = {
	type: "Pose" | "Animation";
	id: number;
	looped?: boolean;
	priority: number;
	rebased?: boolean;
	weights?: { [bone in string]: [[number, number, number], [number, number, number]] };
};

export interface Animations {
	[animationName: string]: AnimationContents;
}

export interface DefaultAnimations extends Animations {
	interact: {
		type: "Pose";
		priority: 3;
		id: 14461014204;
	};
}

export interface WeaponAnimations extends DefaultAnimations {}

export interface GrenadeAnimations extends DefaultAnimations {
	throw: {
		type: "Animation";
		priority: 2;
		id: 14461014204;
	};
}

export interface UseableAnimations extends DefaultAnimations {
	use: {
		type: "Animation";
		priority: 2;
		id: 14461014204;
	};
}

const globalDefaultAnimations: DefaultAnimations = {
	interact: {
		type: "Pose",
		priority: 3,
		id: 14461014204,
	},
	checkWatch: {
		type: "Pose",
		priority: 3,
		id: 14461014204,
	},
};

export const weaponDefaultAnimations: WeaponAnimations = {
	...globalDefaultAnimations,
	...{
		reload: {
			type: "Animation",
			id: 14643007671,
			priority: 2,
		},
		equip: {
			type: "Animation",
			id: 14642999480,
			priority: 2,
		},
		chamberToReady: {
			type: "Animation",
			id: 14642991821,
			priority: 2,
		},
		magCheck: {
			type: "Animation",
			id: 14643016064,
			priority: 2,
		},
		idle: {
			type: "Animation",
			id: 14643032549,
			priority: 1,
			looped: true,
		},
		chamberCheck: {
			type: "Animation",
			id: 14643029100,
			priority: 2,
		},
		run: {
			type: "Animation",
			id: 14449811036,
			priority: 2,
			looped: true,
		},
	},
};

export const grenadeDefaultAnimations: GrenadeAnimations = {
	...globalDefaultAnimations,
	...{
		throw: {
			type: "Animation",
			priority: 2,
			id: 14461014204,
		},
	},
};

export const useableDefaultAnimations: UseableAnimations = {
	...globalDefaultAnimations,
	...{
		use: {
			type: "Animation",
			priority: 2,
			id: 14461014204,
		},
	},
};
