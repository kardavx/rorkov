export type UUID = number;

let lastUUID = 0;
export const generateUUID = (): number => {
	return ++lastUUID;
};
