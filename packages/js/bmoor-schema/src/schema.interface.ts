import {DynamicObject} from '@bmoor/object';

import type {
	FieldInfo,
	FieldInterface,
	FieldReference,
} from './field.interface.ts';
import type {RelationshipJSON} from './relationship.interface.ts';

export type SchemaReference = string;

export type SchemaFieldSet = {ref: string; path: string}[];

export type SchemaStructure =
	| DynamicObject<string | string[]>
	| SchemaFieldSet;

export interface SchemaJSON {
	reference?: SchemaReference;
	structure: SchemaStructure;
	info: Record<FieldReference, FieldInfo>;
	relationships?: RelationshipJSON[];
}

export interface SchemaSettings extends SchemaJSON {
	metadata?: boolean;
}

// TODO: This tells me typing should be more global, so make it part of environment and not part
// of the schema at all
export interface SchemaRelationship {
	type: 'toOne' | 'toMany'; // type of join
	fields: FieldInterface[];
	other: SchemaInterface; // name of the other schema
	otherFields: FieldInterface[];
}

export interface SchemaInterface {
	getReference(): SchemaReference;
	getPrimaryFields(): FieldInterface[];
	getMountFields(): FieldInterface[];
	getFields(): FieldInterface[];
	getField(ref: FieldReference): FieldInterface;

	implode(root: DynamicObject): DynamicObject;
	explode(root: DynamicObject): DynamicObject;

	toJSON(): SchemaJSON;
}
