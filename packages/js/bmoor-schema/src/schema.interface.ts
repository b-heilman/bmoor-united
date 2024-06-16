import {DynamicObject} from '@bmoor/object';

import {BuilderJSONSchemaObject} from './builder/jsonschema.interface';
import {
	ConnectionActionsType,
	ConnectionJSON,
} from './connection.interface';
import {ConnectorReadable} from './connector.interface';
import {ConnectorContextInterface} from './connector/context.interface';
import {
	FieldInfo,
	FieldInterface,
	FieldJSON,
	FieldReference,
} from './field.interface';
import {RelationshipJSON} from './relationship.interface';
import {ValidationJSON} from './validation.interface';

export type SchemaReference = string;

export interface SchemaStructured<
	ActionsT extends ConnectionActionsType = ConnectionActionsType,
> {
	reference?: SchemaReference;
	structure: DynamicObject<string | string[]>;
	info: Record<string, FieldInfo>;
	validators?: Record<FieldReference, ValidationJSON>;
	relationships?: RelationshipJSON[];
	connection?: ConnectionJSON<ActionsT>;
}

export interface SchemaJSON<
	ActionsT extends ConnectionActionsType = ConnectionActionsType,
> {
	reference?: SchemaReference;
	fields: FieldJSON[];
	validators?: Record<FieldReference, ValidationJSON>;
	relationships?: RelationshipJSON[];
	connection?: ConnectionJSON<ActionsT>;
}

export interface SchemaSettings<
	ActionsT extends ConnectionActionsType = ConnectionActionsType,
> extends SchemaJSON<ActionsT> {}

export interface SchemaInterface<
	ActionsT extends ConnectionActionsType = ConnectionActionsType,
> extends ConnectorReadable<ActionsT> {
	setContext(ctx: ConnectorContextInterface);

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

	getConnectionActions(): ActionsT;

	toJSON(): SchemaJSON;
	toJSONSchema(): BuilderJSONSchemaObject;
	toGraphql(): string;
	toTypescript(): string;
}
