import {DynamicObject} from '@bmoor/object';
import {
	PathArray,
	PathLeaf,
	PathObject,
} from '@bmoor/path/src/path.interface';

import {SchemaContextInterface} from './schema/context.interface';
import {ValidationJSON} from './validation.interface';

export type FieldPath = string;
export type FieldType = string;
export type FieldReference = string;

export interface FieldInfo {
	type: FieldType;
	use?: 'primary' | 'synthetic';
	required?: boolean;
}

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
	getPathChain(): FieldPathLink[];

	setValidator(settings: ValidationJSON);
	// Only returns a string if invalid, otherwise returns null
	validate(
		ctx: SchemaContextInterface,
		root: DynamicObject<T>,
		mode: 'create' | 'update',
	): Promise<string>;

	read(root: DynamicObject<T>): T;
	write(root: DynamicObject<T>, v: T);
}
