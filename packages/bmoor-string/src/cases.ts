export function toKebabCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.toLowerCase();
}

export function toCamelCase(str: string): string {
	return str.replace(
		/(^|[-\s]+)(\w)/g,
		function (whole, left, right, index) {
			if (index === 0) {
				return right.toLowerCase();
			} else {
				return right.toUpperCase();
			}
		}
	);
}

export function toProperCase(str: string): string {
	const rtn = toCamelCase(str);

	return rtn.charAt(0).toUpperCase() + rtn.slice(1);
}
