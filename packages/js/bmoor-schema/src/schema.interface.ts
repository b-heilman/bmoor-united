import {DynamicObject} from '@bmoor/object';

import {BuilderJSONSchemaObject} from './builder/jsonschema.interface';
import {ContextInterface} from './context.interface';
import {
	FieldInfo,
	FieldInterface,
	FieldReference,
} from './field.interface';
import {RelationshipJSON} from './relationship.interface';
import {ValidationJSON} from './validation.interface';

export type SchemaReference = string;

export type SchemaFieldSet = {ref: string; path: string}[];

export type SchemaStructure =
	| DynamicObject<string | string[]>
	| SchemaFieldSet;

export interface SchemaJSON {
	reference?: SchemaReference;
	structure: SchemaStructure;
	info: Record<string, FieldInfo>;
	validators?: Record<FieldReference, ValidationJSON>;
	relationships?: RelationshipJSON[];
}

export interface SchemaSettings extends SchemaJSON {}

export interface SchemaInterface {
	setContext(ctx: ContextInterface);

	getReference(): SchemaReference;
	getPrimaryField(): FieldInterface;
	getFields(): FieldInterface[];
	getField(ref: FieldReference): FieldInterface;
	getRelationships(): RelationshipJSON[];
	getRelationship(ref: SchemaReference): RelationshipJSON;

	implode(root: DynamicObject): DynamicObject;
	explode(root: DynamicObject): DynamicObject;

	validate(
		root: DynamicObject,
		mode?: 'create' | 'update',
	): Promise<string[]>;

	toJSON(): SchemaJSON;
	toJSONSchema(): BuilderJSONSchemaObject;
	toTypescript(): string;
}
