import {DynamicObject} from '@bmoor/object';

import {
	FieldInfo,
	FieldInterface,
	FieldJSON,
	FieldReference,
} from './field.interface';
import {RelationshipJSON} from './schema/relationship.interface';
import {ValidationJSON} from './schema/validation.interface';

export type SchemaReference = string;

export interface SchemaStructured {
	reference?: SchemaReference;
	structure: DynamicObject<string>;
	info: Record<string, FieldInfo>;
	relationships?: Record<FieldReference, RelationshipJSON>;
	validations?: Record<FieldReference, ValidationJSON>;
}

export interface SchemaJSON {
	reference?: SchemaReference;
	fields: FieldJSON[];
	relationships?: Record<FieldReference, RelationshipJSON>;
	validations?: Record<FieldReference, ValidationJSON>;
}

export interface SchemaInterface {
	getFields(): FieldInterface[];
	getField(ref: FieldReference): FieldInterface;
	toJSON(): SchemaJSON;
}
