type AllowedFireModes = "Semi" | "Auto" | "Burst";
type AllowedHealTypes = "Bandage" | "Splint" | "Health";

export interface Properties {
	[propertyName: string]: unknown;
}

export interface DefaultProperties extends Properties {
	length: number;
	weight: number; //kg's
}

export interface WeaponProperties extends DefaultProperties {
	fireRate: number;
	slideMoveBack: number;
	recoil: {
		multiplier: 1;
		// shotsToControl: number; // the initial punch will chill out after x shots
		// camera: [[x: number, y: number, z: number], [rx: number, ry: number, rz: number]]; // [[x,y,z], [rx,ry,rz]]
		// weapon: [[x: number, y: number, z: number], [rx: number, ry: number, rz: number]]; // [[x,y,z], [rx,ry,rz]]
	};
	allowedFireModes: AllowedFireModes[];
}

export interface GrenadeProperties extends DefaultProperties {
	grenadeEffect: "Flash" | "Nade";
	weight: number; // kg's - weight affects the projectile (height factor, distance factor) bigger weight = less throw lol
	timeToExplode: number; // seconds, amount of time before the grenade blows up - timer starts after the throw
}

export interface UseableProperties extends DefaultProperties {
	useableType: "Heal" | "Food" | "Liquid";
	healType?: AllowedHealTypes[];
	healthAddAmount?: number;
	capacity: number;
}

const globalDefaultProperties: Readonly<DefaultProperties> = {
	length: 3,
	weight: 1,
};

export const weaponDefaultProperties: Readonly<WeaponProperties> = {
	...globalDefaultProperties,
	...{
		fireRate: 650,
		weight: 3,
		slideMoveBack: -0.35,
		recoil: {
			multiplier: 1,
		},
		allowedFireModes: ["Semi"],
	},
};

export const grenadeDefaultProperties: Readonly<GrenadeProperties> = {
	...globalDefaultProperties,
	...{
		grenadeEffect: "Flash",
		weight: 2,
		timeToExplode: 7,
	},
};

export const useableDefaultProperties: Readonly<UseableProperties> = {
	...globalDefaultProperties,
	...{
		useableType: "Heal",
		weight: 0.5,
		healType: ["Bandage", "Splint", "Health"],
		healthAddAmount: 20,
		capacity: 60,
	},
};
