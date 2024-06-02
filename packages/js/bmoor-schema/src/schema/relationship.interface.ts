import {FieldReference} from './field.interface';

export interface RelationshipJSON {
	other: string;
	fields: FieldReference[];
	otherFields: FieldReference[];
}
