import { sharedAnimations, Animations } from "./shared";

const itemAnimations: Animations = {
	Reload: {
		type: "Animation",
		id: 14461014204,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	Equip: {
		type: "Animation",
		id: 14461014204,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	ChamberToReady: {
		type: "Animation",
		id: 14461014204,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	MagCheck: {
		type: "Animation",
		id: 14461014204,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	Idle: {
		type: "Animation",
		id: 14461014204,
		looped: true,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	Run: {
		type: "Animation",
		id: 14461014204,
		looped: true,
		weights: [
			[1, 1, 1],
			[2, 2, 2],
		],
	},
};

export default {
	...sharedAnimations,
	...itemAnimations,
};
