import {ContextInterface} from './context.interface';
import {
	SchemaInterface,
	SchemaJSON,
	SchemaReference,
} from './schema.interface';

export interface DictionaryJSON {
	schemas: SchemaJSON[];
}

export interface DictionaryInterface<
	SchemaT extends SchemaInterface = SchemaInterface,
> extends ContextInterface {
	addSchema(schema: SchemaT);

	getSchema(ref: SchemaReference): SchemaT;

	toJSON(): DictionaryJSON;
}
