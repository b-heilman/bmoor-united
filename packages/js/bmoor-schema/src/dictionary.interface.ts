import {
	SchemaInterface,
	SchemaJSON,
	SchemaReference,
} from './schema.interface';

export interface DictionaryJSON {
	schemas: SchemaJSON[];
}

export interface DictionaryInterface {
	getSchema(ref: SchemaReference): SchemaInterface;

	toJSON(): DictionaryJSON;
}
