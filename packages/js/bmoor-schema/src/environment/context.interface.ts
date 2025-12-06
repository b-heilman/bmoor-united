import {DynamicObject} from '@bmoor/object';

import type {
	SchemaInterface,
	SchemaJSON,
	SchemaReference,
} from '../schema.interface.ts';

export interface EnvironmentContextJSON {
	schemas: SchemaJSON[];
}

export interface EnvironmentContextInterface<
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

	toJSON(): EnvironmentContextJSON;
}
