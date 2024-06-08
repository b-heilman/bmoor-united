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

	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	read(ref: SchemaReference, select: any): Promise<any[]>;

	toJSON(): DictionaryJSON;
}
