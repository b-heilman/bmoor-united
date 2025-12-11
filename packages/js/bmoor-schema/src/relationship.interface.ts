import type {FieldReference} from './field.interface.ts';
import type {SchemaReference} from './schema.interface.ts';

export type RelationshipReference = string;

export interface RelationshipJSON {
	reference: RelationshipReference; // Used to refer to this relationship
	type: 'toOne' | 'toMany'; // type of join
	mount?: FieldReference;  // matches a mount field's path
	fields: FieldReference[];
	other: SchemaReference; // name of the other schema
	otherFields: FieldReference[];
}
