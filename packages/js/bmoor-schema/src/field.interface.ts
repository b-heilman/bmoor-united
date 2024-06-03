import {DynamicObject} from '@bmoor/object';
import {
	PathArray,
	PathLeaf,
	PathObject,
} from '@bmoor/path/src/path.interface';

export type FieldReference = string;

export interface FieldInfo {
	type: string;
	primary?: boolean;
	required?: boolean;
}

export interface FieldJSON {
	ref?: FieldReference;
	path: string;
	info: FieldInfo;
}

export interface FieldPathObject extends PathObject {}

export interface FieldPathArray extends PathArray {}

export interface FieldPathLeaf extends PathLeaf {
	fieldType: string;
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
	getPathChain(): FieldPathLink[];

	read(root: DynamicObject<T>): T;
	write(root: DynamicObject<T>, v: T);
}
