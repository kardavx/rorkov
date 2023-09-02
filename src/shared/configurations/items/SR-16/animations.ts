import { WeaponAnimations } from "../default/animations";

const animations: Partial<WeaponAnimations> = {
	reload: {
		type: "Animation",
		id: 14461014204,
		priority: 2,
	},
	equip: {
		type: "Animation",
		id: 14447419427,
		priority: 2,
	},
	chamberToReady: {
		type: "Animation",
		id: 14447411436,
		priority: 2,
	},
	magCheck: {
		type: "Animation",
		id: 14447427935,
		priority: 2,
	},
	idle: {
		type: "Pose",
		id: 14447422907,
		priority: 1,
		looped: true,
	},
	run: {
		type: "Animation",
		id: 14449811036,
		priority: 2,
		looped: true,
	},
};

export default animations;
