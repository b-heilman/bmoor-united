import {DynamicObject} from '@bmoor/object';

import {ConnectorJSON, ConnectorReadable} from './connector.interface';
import {
	FieldInfo,
	FieldInterface,
	FieldJSON,
	FieldReference,
} from './field.interface';
import {RelationshipJSON} from './relationship.interface';
import {ValidatorJSON} from './validator.interface';

export type SchemaReference = string;

export interface SchemaStructured {
	reference?: SchemaReference;
	structure: DynamicObject<string | string[]>;
	info: Record<string, FieldInfo>;
	validators?: Record<FieldReference, ValidatorJSON>;
	relationships?: RelationshipJSON[];
	connection?: ConnectorJSON;
}

export interface SchemaJSON {
	reference?: SchemaReference;
	fields: FieldJSON[];
	validators?: Record<FieldReference, ValidatorJSON>;
	relationships?: RelationshipJSON[];
	connection?: ConnectorJSON;
}

export interface SchemaSettings extends SchemaJSON {}

export interface SchemaInterface extends ConnectorReadable {
	getReference(): SchemaReference;
	getPrimaryField(): FieldInterface;
	getFields(): FieldInterface[];
	getField(ref: FieldReference): FieldInterface;
	getRelationships(): RelationshipJSON[];
	getRelationship(ref: SchemaReference): RelationshipJSON;

	toJSON(): SchemaJSON;
}
