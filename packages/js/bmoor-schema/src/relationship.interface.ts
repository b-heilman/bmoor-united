import {FieldReference} from './field.interface';
import {SchemaReference} from './schema.interface';

export type RelationshipReference = string;

export enum RelationshipType {
	toMany= 'toMany',
	toOne= 'toOne'
}

export interface RelationshipJSON {
	reference: RelationshipReference;
	type: 'toMany' | 'toOne'; 
	other: SchemaReference;
	fields: FieldReference[];
	otherFields: FieldReference[];
}
