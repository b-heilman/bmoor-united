import {FieldReference} from './field.interface';
import {SchemaReference} from './schema.interface';

export interface RelationshipJSON {
	other: SchemaReference;
	fields: FieldReference[];
	otherFields: FieldReference[];
}
