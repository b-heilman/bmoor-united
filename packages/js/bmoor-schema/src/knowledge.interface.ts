import {DynamicObject} from '@bmoor/object';

import {
	SchemaInterface,
	SchemaJSON,
	SchemaReference,
} from './schema.interface';

export interface KnowledgeJSON {
	schemas: SchemaJSON[];
}

export interface KnowledgeInterface<
	SchemaT extends SchemaInterface = SchemaInterface,
> {
	addSchema(schema: SchemaT);
	getSchema(ref: SchemaReference): SchemaT;
	getSchemas(): SchemaT[];

	validate(
		ref: SchemaReference,
		root: DynamicObject,
		mode?: 'create' | 'update',
	): Promise<string[]>;

	toJSON(): KnowledgeJSON;
}
