import {DynamicObject} from '@bmoor/object';

import {BuilderJSONSchemaObject} from './builder/jsonschema.interface';
import {EnvironmentContextInterface} from './environment/context.interface';
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
	info: Record<FieldReference, FieldInfo>;
	validators?: Record<FieldReference, ValidationJSON>;
	relationships?: RelationshipJSON[];
}

export interface SchemaSettings extends SchemaJSON {
	metadata?: boolean;
}

export interface SchemaInterface {
	setSpace(know: EnvironmentContextInterface);

	getReference(): SchemaReference;
	getPrimaryFields(): FieldInterface[];
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
