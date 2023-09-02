import { WeaponAnimations } from "../default/animations";

const animations: Partial<WeaponAnimations> = {
	reload: {
		type: "Animation",
		id: 14461014204,
		priority: 2,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	equip: {
		type: "Animation",
		id: 14447419427,
		priority: 2,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	chamberToReady: {
		type: "Animation",
		id: 14447411436,
		priority: 2,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	magCheck: {
		type: "Animation",
		id: 14447427935,
		priority: 2,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	idle: {
		type: "Pose",
		id: 14447422907,
		priority: 1,
		looped: true,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	run: {
		type: "Animation",
		id: 14449811036,
		priority: 2,
		looped: true,
		weights: [
			[1, 1, 1],
			[2, 2, 2],
		],
	},
};

export default animations;
