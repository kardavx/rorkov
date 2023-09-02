import { WeaponAnimations } from "../default/animations";

const animations: Partial<WeaponAnimations> = {
	reload: {
		type: "Animation",
		id: 14534432370,
		priority: 2,
	},
	equip: {
		type: "Animation",
		id: 14534473899,
		priority: 2,
	},
	chamberToReady: {
		type: "Animation",
		id: 14534465960,
		priority: 2,
	},
	magCheck: {
		type: "Animation",
		id: 14534481094,
		priority: 2,
	},
	idle: {
		type: "Pose",
		id: 14590142914,
		priority: 1,
		looped: true,
	},
	run: {
		type: "Animation",
		id: 14534444618,
		priority: 2,
		looped: true,
	},
};

export default animations;
