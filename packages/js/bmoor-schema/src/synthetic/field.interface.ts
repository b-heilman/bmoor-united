import {DynamicObject} from '@bmoor/object';
import {
	PathArray,
	PathLeaf,
	PathObject,
} from '@bmoor/path/src/path.interface.ts';

import { FieldBaseInfo, FieldType, FieldJSON, FieldReference } from '../field.interface.ts';
import { SchemaInterface, SchemaReference } from '../schema.interface.ts';

/****
 * TODO: define three typed of fields
 * ------
 * mount: directly loads in an object of a different schema
 * reference: loads in a field from a different schema
 * computed: loads in fields from a different schema and does a calculation
 *   - computed fields don't allow input, therefor no validation
 ***/

export interface SyntheticFieldMountInfo extends FieldBaseInfo {
	schema: SchemaInterface
}

export interface SyntheticFieldReferenceInfo extends FieldBaseInfo {
	reference: FieldInterface;
}

export interface SyntheticFieldComputedInfo extends FieldBaseInfo {
	type: FieldType;
	arguments: FieldInterface[];
	fn: (...args: any[]) => any;
}

export type SyntheticFieldInfo = 
	SyntheticFieldMountInfo | 
	SyntheticFieldReferenceInfo | 
	SyntheticFieldComputedInfo;

export interface FieldReferenceJSON {
	schema: SchemaReference,
	field: FieldReference
}

export interface SyntheticFieldMountJSON extends FieldJSON {
	schema: SchemaReference
}

export interface SyntheticFieldReferenceJSON extends FieldJSON {
	reference: FieldReferenceJSON
}

export interface SyntheticFieldComputedJSON extends FieldJSON {
	arguments: FieldReferenceJSON[];
	fn: string // for now, how I'll encode
}
	
export type SyntheticFieldJSON = 
	SyntheticFieldMountJSON | 
	SyntheticFieldReferenceJSON | 
	SyntheticFieldComputedJSON;

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
