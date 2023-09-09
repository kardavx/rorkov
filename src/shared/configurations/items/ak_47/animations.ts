import { WeaponAnimations } from "../default/animations";

const animations = {
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
		type: "Pose",
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
		priority: 3,
		looped: true,
		weights: {
			"Left Arm": [
				[0, 0, 0],
				[0, 0, 0],
			],
		},
	},
};

export default animations;
