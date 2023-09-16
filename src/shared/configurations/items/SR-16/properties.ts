import { WeaponProperties } from "../default/properties";

const properties: Partial<WeaponProperties> = {
	weight: 3, //kg's
	slideDirection: new Vector3(0, 0, -1),
	aimOffset: 2,
	recoil: {
		multiplier: 1,
	},
	allowedFireModes: ["Auto", "Semi", "Burst"],
};

export default properties;
