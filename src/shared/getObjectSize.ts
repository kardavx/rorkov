export default (object: { [key in string]: unknown }) => {
	let size = 0;
	for (const [value, key] of pairs(object)) {
		size += 1;
	}
	return size;
};
