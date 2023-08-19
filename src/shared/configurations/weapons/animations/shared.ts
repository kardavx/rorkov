type Animations = {
	[animationName in string]: {
		type: "Pose" | "Animation";
		id: number;
	};
};

export default {
	Interact: {
		type: "Pose",
		id: 3333,
	},
};
