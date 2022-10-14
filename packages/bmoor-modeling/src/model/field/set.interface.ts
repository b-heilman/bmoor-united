export type TypescriptUsage = {
	read: string;
	reference: string;
	create: string;
	update: string;
	search: string;
};

export type ModelFieldSetTypescript = {
	external: TypescriptUsage;
	internal: TypescriptUsage;
};
