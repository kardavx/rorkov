import { WeaponProperties } from "../default/properties";

const properties: Partial<WeaponProperties> = {
	weight: 3, //kg's
	slideDirection: new Vector3(-1, 0, 0),
	aimOffset: 1.4,
	recoil: {
		multiplier: 1,
	},
	allowedFireModes: ["Auto", "Semi", "Burst"],
};

export default properties;
