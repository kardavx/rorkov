export type Animations = {
	[animationName in string]: {
		type: "Pose" | "Animation";
		id: number;
		looped?: boolean;
		weights?: [position: [x: number, y: number, z: number], rotation: [x: number, y: number, z: number]];
	};
};

export const sharedAnimations: Animations = {
	Interact: {
		type: "Pose",
		id: 3333,
	},
};
