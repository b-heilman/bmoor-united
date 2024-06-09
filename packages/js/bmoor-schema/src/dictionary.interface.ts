import {ConnectorContextInterface} from './connector/context.interface';
import {
	SchemaInterface,
	SchemaJSON,
	SchemaReference,
} from './schema.interface';
import {TypingJSON} from './typing.interface';

export interface DictionaryJSON {
	schemas: SchemaJSON[];
}

export interface DictionaryInterface<
	TypingT extends TypingJSON,
	SchemaT extends SchemaInterface = SchemaInterface,
> extends ConnectorContextInterface<TypingT> {
	addSchema(schema: SchemaT);
	getSchema(ref: SchemaReference): SchemaT;
	getSchemas(): SchemaT[];

	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	read(ref: SchemaReference, select: any): Promise<any[]>;

	toJSON(): DictionaryJSON;
}
