// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type MappingHook = (any) => any;
export type MappingSettings = {
	from: string;
	to: string;
	hook?: MappingHook;
};
