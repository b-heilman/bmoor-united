import type {FieldReference} from './field.interface.ts';
import type {SchemaReference} from './schema.interface.ts';

export type RelationshipReference = string;

export interface RelationshipJSON {
	reference: RelationshipReference;
	type: 'toOne' | 'toMany';
	other: SchemaReference;
	fields: FieldReference[];
	otherFields: FieldReference[];
}
