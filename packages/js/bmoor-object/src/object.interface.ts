export type ParsedPathType = Array<string>;
export type IncomingPathType = string | ParsedPathType;

// base functionality does not support arrays
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type DynamicObject<T = any> = {
	[key: string]: T | DynamicObject<T> | DynamicObject<T>[];
};

// https://www.typescriptlang.org/docs/handbook/2/functions.html
export type SetterFn<T> = (
	root: DynamicObject<T>,
	value: T,
) => DynamicObject<T>;

export type GetterFn<T> = (root: DynamicObject<T>) => T;

export type MappedObject<T> = {[key: string]: T};

export type IgnoreSettings = {[key: string]: boolean | IgnoreSettings};

export interface ImplodeSettings {
	ignore?: IgnoreSettings;
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	skipInstanceOf?: any;
}
