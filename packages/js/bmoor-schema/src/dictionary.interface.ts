import {DynamicObject} from '@bmoor/object';

import {ContextInterface} from './context.interface';
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
> extends ContextInterface<TypingT> {
	addSchema(schema: SchemaT);
	getSchema(ref: SchemaReference): SchemaT;
	getSchemas(): SchemaT[];

	validate(
		ref: SchemaReference,
		root: DynamicObject,
		mode?: 'create' | 'update',
	): Promise<string[]>;

	toJSON(): DictionaryJSON;
}
