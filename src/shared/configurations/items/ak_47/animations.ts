import { WeaponAnimations } from "../default/animations";

const animations: Partial<WeaponAnimations> = {
	reload: {
		type: "Animation",
		id: 14643007671,
		priority: 2,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	equip: {
		type: "Animation",
		id: 14642999480,
		priority: 2,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	chamberToReady: {
		type: "Animation",
		id: 14642991821,
		priority: 2,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	magCheck: {
		type: "Animation",
		id: 14643016064,
		priority: 2,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	idle: {
		type: "Pose",
		id: 14643032549,
		priority: 1,
		looped: true,
		weights: [
			[2, 2, 2],
			[1, 1, 1],
		],
	},
	chamberCheck: {
		type: "Animation",
		id: 14643029100,
		priority: 2,
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
