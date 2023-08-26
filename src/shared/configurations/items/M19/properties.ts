import { WeaponProperties } from "../default/properties";

const properties: Partial<WeaponProperties> = {
	weight: 1.1, //kg's
	recoil: {
		multiplier: 1,
	},
	allowedFireModes: ["Auto", "Semi", "Burst"],
};

export default properties;
