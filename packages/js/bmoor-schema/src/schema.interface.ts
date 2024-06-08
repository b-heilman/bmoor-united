import {DynamicObject} from '@bmoor/object';

import {
	ConnectionActionsType,
	ConnectionJSON,
} from './connection.interface';
import {ConnectorReadable} from './connector.interface';
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
	getReference(): SchemaReference;
	getPrimaryField(): FieldInterface;
	getFields(): FieldInterface[];
	getField(ref: FieldReference): FieldInterface;
	getRelationships(): RelationshipJSON[];
	getRelationship(ref: SchemaReference): RelationshipJSON;

	implode(root: DynamicObject): DynamicObject;
	explode(root: DynamicObject): DynamicObject;

	getConnectionActions(): ActionsT;

	toJSON(): SchemaJSON;
}
