const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;
const EDGE_DASHES_REGEX = /^-+|-+$/g;

export function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(NON_ALPHANUMERIC_REGEX, "-")
		.replace(EDGE_DASHES_REGEX, "")
		.slice(0, 80);
}
