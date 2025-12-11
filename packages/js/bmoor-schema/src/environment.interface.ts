import type {
	SchemaInterface,
	SchemaJSON,
	SchemaReference,
} from './schema.interface.ts';

export interface EnvironmentJSON {
	schemas: SchemaJSON[];
}

export interface EnvironmentInterface<
	SchemaT extends SchemaInterface = SchemaInterface,
> {
	addSchema(schema: SchemaT);
	getSchema(ref: SchemaReference): SchemaT;
	getSchemas(): SchemaT[];

	toJSON(): EnvironmentJSON;
}
