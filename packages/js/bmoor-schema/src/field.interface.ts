import {DynamicObject} from '@bmoor/object';
import {
	PathArray,
	PathLeaf,
	PathObject,
} from '@bmoor/path/src/path.interface.ts';

import type {SchemaContextInterface} from './schema/context.interface.ts';
import type {ValidationJSON} from './validation.interface.ts';

export type FieldPath = string;
export type FieldType = string;
export type FieldReference = string;

export enum FieldUse {
	primary = 'primary',
	synthetic = 'synthetic'
}

export enum FieldNeed {
	required = 'required',
	nullable = 'nullable',
	optional = 'optional'
}

export interface FieldInfo {
	type: FieldType;
	use?: keyof typeof FieldUse;
	need?: keyof typeof FieldNeed;
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
