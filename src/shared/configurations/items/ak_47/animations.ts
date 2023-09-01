import { WeaponAnimations } from "../default/animations";

const animations: Partial<WeaponAnimations> = {
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
};

export default animations;
