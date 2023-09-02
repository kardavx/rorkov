import { WeaponAnimations } from "../default/animations";

const animations: Partial<WeaponAnimations> = {
	reload: {
		type: "Animation",
		id: 14534432370,
		priority: 2,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	equip: {
		type: "Animation",
		id: 14534473899,
		priority: 2,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	chamberToReady: {
		type: "Animation",
		id: 14534465960,
		priority: 2,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	magCheck: {
		type: "Animation",
		id: 14534481094,
		priority: 2,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	idle: {
		type: "Pose",
		id: 14590142914,
		priority: 1,
		looped: true,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	run: {
		type: "Animation",
		id: 14534444618,
		priority: 2,
		looped: true,
		weights: [
			[1, 1, 1],
			[2, 2, 2],
		],
	},
};

export default animations;
