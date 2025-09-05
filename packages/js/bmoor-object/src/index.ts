export * from './object.interface.ts';
export type {
	DynamicObject,
	SetterFn,
	GetterFn,
	MappedObject,
	ParsedPathType,
} from './object.ts';

export {
	parsePath,
	set,
	makeSetter,
	get,
	makeGetter,
	del,
	explode,
	implode,
	keys,
	merge,
	equals,
} from './object.ts';
