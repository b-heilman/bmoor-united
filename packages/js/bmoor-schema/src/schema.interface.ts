import {DynamicObject} from '@bmoor/object';

import {
	ConnectorActionsType,
	ConnectorJSON,
	ConnectorReadable,
} from './connector.interface';
import {
	FieldInfo,
	FieldInterface,
	FieldJSON,
	FieldReference,
} from './field.interface';
import {RelationshipJSON} from './relationship.interface';
import {ValidatorJSON} from './validator.interface';

export type SchemaReference = string;

export interface SchemaStructured<
	ActionsT extends ConnectorActionsType = ConnectorActionsType,
> {
	reference?: SchemaReference;
	structure: DynamicObject<string | string[]>;
	info: Record<string, FieldInfo>;
	validators?: Record<FieldReference, ValidatorJSON>;
	relationships?: RelationshipJSON[];
	connection?: ConnectorJSON<ActionsT>;
}

export interface SchemaJSON<
	ActionsT extends ConnectorActionsType = ConnectorActionsType,
> {
	reference?: SchemaReference;
	fields: FieldJSON[];
	validators?: Record<FieldReference, ValidatorJSON>;
	relationships?: RelationshipJSON[];
	connection?: ConnectorJSON<ActionsT>;
}

export interface SchemaSettings<
	ActionsT extends ConnectorActionsType = ConnectorActionsType,
> extends SchemaJSON<ActionsT> {}

export interface SchemaInterface<
	ActionsT extends ConnectorActionsType = ConnectorActionsType,
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
