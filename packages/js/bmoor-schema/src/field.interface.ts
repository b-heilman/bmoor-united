import {DynamicObject} from '@bmoor/object';
import {
	PathArray,
	PathLeaf,
	PathObject,
} from '@bmoor/path/src/path.interface.ts';

export type FieldPath = string;
export type FieldType = string;
export type FieldReference = string;

export enum FieldNeed {
	required = 'required',
	nullable = 'nullable',
	optional = 'optional',
}

export interface FieldBaseInfo {
	need?: FieldNeed;
	isMany?: boolean;
}

export interface FieldGeneralInfo extends FieldBaseInfo {
	primary?: boolean;
	type: FieldType;
}

export type FieldInfo = FieldGeneralInfo;

export interface FieldJSON {
	ref?: FieldReference;
	path: FieldPath;
	info: FieldInfo;
}

// eslint-disable-next-line
export interface FieldPathObject extends PathObject {}

// eslint-disable-next-line
export interface FieldPathArray extends PathArray {}

export interface FieldPathLeaf extends PathLeaf {
	fieldType: FieldType;
}

export type FieldPathLink =
	| FieldPathObject
	| FieldPathArray
	| FieldPathLeaf;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export interface FieldInterface<T = any> {
	getReference(): FieldReference;
	getInfo(): FieldInfo;
	getPath(): string;
	getType(): string;
	getPathChain(): FieldPathLink[];

	read(root: DynamicObject<T>): T;
	write(root: DynamicObject<T>, v: T);
}
