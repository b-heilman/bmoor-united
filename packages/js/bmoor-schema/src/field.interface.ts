import {DynamicObject} from '@bmoor/object';
import {
	PathArray,
	PathLeaf,
	PathObject,
} from '@bmoor/path/src/path.interface.ts';
import { RelationshipReference } from './relationship.interface.ts';

export type FieldPath = string;
export type FieldType = string;
export type FieldReference = string;

export enum FieldNeed {
	required = 'required',
	nullable = 'nullable',
	optional = 'optional',
}

/** 
 * FieldComputedInfo
 * use: FieldUse.computed
 * 
 * FieldGeneralInfo
 * use?: FieldUse.primary
 */
export interface FieldBaseInfo {
	need?: FieldNeed;
}

export interface FieldGeneralInfo extends FieldBaseInfo {
	primary?: boolean;
	type: FieldType;
}

export interface FieldAliasInfo extends FieldBaseInfo {
	alias: FieldInterface;
}

// A mount should always be expected to be an array or object, probably
// should validate
export interface FieldMountInfo extends FieldBaseInfo {
	mount: RelationshipReference
	type: FieldType
}

export type FieldInfo = FieldGeneralInfo | FieldAliasInfo | FieldMountInfo;

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
