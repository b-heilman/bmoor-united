import {DynamicObject} from '@bmoor/object';

import type {EnvironmentInterface} from './environment.interface.ts';
import type {
	FieldInfo,
	FieldInterface,
	FieldReference,
} from './field.interface.ts';
import type {
	RelationshipJSON,
	RelationshipReference
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

export interface SchemaInterface<TypingT extends TypingJSON = TypingJSON> {
	setEnvironment(know: EnvironmentInterface);
	getTyping(): TypingInterface<TypingT>;
	getEnvironment(): EnvironmentInterface;

	getReference(): SchemaReference;
	getPrimaryFields(): FieldInterface[];
	getFields(): FieldInterface[];
	getField(ref: FieldReference): FieldInterface;
	getRelationships(): RelationshipJSON[];
	getRelationship(ref: RelationshipReference): RelationshipJSON;

	implode(root: DynamicObject): DynamicObject;
	explode(root: DynamicObject): DynamicObject;

	toJSON(): SchemaJSON;
}
