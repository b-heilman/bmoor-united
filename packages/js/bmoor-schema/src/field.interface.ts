import {DynamicObject} from '@bmoor/object';
import {
	PathArray,
	PathLeaf,
	PathObject,
} from '@bmoor/path/src/path.interface';

import {ContextInterface} from './context.interface';
import {ValidationJSON} from './validation.interface';

export type FieldReference = string;

export interface FieldInfo {
	type: string;
	use?: 'primary' | 'synthetic';
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

	setValidator(settings: ValidationJSON);
	// Only returns a string if invalid, otherwise returns null
	validate(
		ctx: ContextInterface,
		root: DynamicObject<T>,
		mode: 'create' | 'update',
	): Promise<string>;

	read(root: DynamicObject<T>): T;
	write(root: DynamicObject<T>, v: T);
}