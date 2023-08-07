// A utility that allows for more in depth object manipulation

export default {
	/**
	 * Get the amount of elements in an object
	 *
	 * @param object Desired object
	 * @returns Amount of elements
	 */
	length: (object: object): number => {
		if (!object) return 0;

		let objectLength = 0;
		for (const [,] of pairs(object)) {
			objectLength++;
		}
		return objectLength;
	},
};
