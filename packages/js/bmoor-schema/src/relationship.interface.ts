import {FieldReference} from './field.interface';
import {SchemaReference} from './schema.interface';

export type RelationshipReference = string;

export interface RelationshipJSON {
	reference: RelationshipReference;
	type: 'toOne' | 'toMany';
	other: SchemaReference;
	fields: FieldReference[];
	otherFields: FieldReference[];
}
