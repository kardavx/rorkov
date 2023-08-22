import { WeaponProperties } from "../default/properties";

const properties: Partial<WeaponProperties> = {
	burstFireRate: 1000,
	burstShotAmount: 3,
	weight: 13, //kg's
	recoil: {
		shotsToControl: 11, // the initial punch will chill out after x shots
		camera: [
			[1, 1, 1],
			[1, 1, 1],
		], // [[x,y,z], [rx,ry,rz]]
		weapon: [
			[1, 1, 1],
			[1, 1, 1],
		], // [[x,y,z], [rx,ry,rz]]
	},
	allowedFireModes: ["Auto", "Semi", "Burst"],
};

export default properties;
