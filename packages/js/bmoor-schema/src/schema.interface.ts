import {DynamicObject} from '@bmoor/object';

import type {EnvironmentInterface} from './environment.interface.ts';
import type {
	FieldInfo,
	FieldInterface,
	FieldReference,
} from './field.interface.ts';
import type {
	RelationshipJSON,
	RelationshipReference,
} from './relationship.interface.ts';
import {TypingInterface, TypingJSON} from './typing.interface.ts';
import type {ValidationJSON} from './validation.interface.ts';

export type SchemaReference = string;

export type SchemaFieldSet = {ref: string; path: string}[];

export type SchemaStructure =
	| DynamicObject<string | string[]>
	| SchemaFieldSet;

export interface SchemaJSON {
	reference?: SchemaReference;
	structure: SchemaStructure;
	info: Record<FieldReference, FieldInfo>;
	validators?: Record<FieldReference, ValidationJSON>;
	relationships?: RelationshipJSON[];
}

export interface SchemaSettings extends SchemaJSON {
	metadata?: boolean;
}

// TODO: This tells me typing should be more global, so make it part of environment and not part
// of the schema at all
export interface SchemaRelationship<TypingT extends TypingJSON = TypingJSON> {
	type: 'toOne' | 'toMany'; // type of join
	fields: FieldInterface[];
	other: SchemaInterface<TypingT>; // name of the other schema
	otherFields: FieldInterface[];
}

export interface SchemaInterface<TypingT extends TypingJSON = TypingJSON> {
	setEnvironment(know: EnvironmentInterface);
	getTyping(): TypingInterface<TypingT>;
	getEnvironment(): EnvironmentInterface;

	getReference(): SchemaReference;
	getPrimaryFields(): FieldInterface[];
	getMountFields(): FieldInterface[];
	getFields(): FieldInterface[];
	getField(ref: FieldReference): FieldInterface;
	getRelationships(): SchemaRelationship<TypingT>[];
	getRelationship(ref: RelationshipReference): SchemaRelationship<TypingT>;

	implode(root: DynamicObject): DynamicObject;
	explode(root: DynamicObject): DynamicObject;

	toJSON(): SchemaJSON;
}
