import { WeaponAnimations } from "../default/animations";

const animations: Partial<WeaponAnimations> = {
	reload: {
		type: "Animation",
		id: 14461014204,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	equip: {
		type: "Animation",
		id: 14447419427,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	chamberToReady: {
		type: "Animation",
		id: 14447411436,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	magCheck: {
		type: "Animation",
		id: 14447427935,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	idle: {
		type: "Animation",
		id: 14447422907,
		looped: true,
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
};

export default animations;
