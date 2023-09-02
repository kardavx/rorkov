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
	interact: {
		type: "Animation";
		id: 14461014204;
	};
}

export interface WeaponAnimations extends DefaultAnimations {}

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
	interact: {
		type: "Animation",
		id: 14461014204,
	},
	checkWatch: {
		type: "Animation",
		id: 14461014204,
	},
};

export const weaponDefaultAnimations: WeaponAnimations = {
	...globalDefaultAnimations,
	...{
		reload: {
			type: "Animation",
			id: 14643007671,
			weights: [
				[2, 2, 2],
				[1, 1, 1],
			],
		},
		equip: {
			type: "Animation",
			id: 14642999480,
			weights: [
				[2, 2, 2],
				[1, 1, 1],
			],
		},
		chamberToReady: {
			type: "Animation",
			id: 14642991821,
			weights: [
				[2, 2, 2],
				[1, 1, 1],
			],
		},
		magCheck: {
			type: "Animation",
			id: 14643016064,
			weights: [
				[2, 2, 2],
				[1, 1, 1],
			],
		},
		idle: {
			type: "Animation",
			id: 14643032549,
			looped: true,
			weights: [
				[2, 2, 2],
				[1, 1, 1],
			],
		},
		chamberCheck: {
			type: "Animation",
			id: 14643029100,
			weights: [
				[2, 2, 2],
				[1, 1, 1],
			],
		},
		run: {
			type: "Animation",
			id: 14449811036,
			looped: true,
			weights: [
				[1, 1, 1],
				[2, 2, 2],
			],
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
