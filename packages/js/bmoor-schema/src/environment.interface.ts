import type {
	SchemaInterface,
	SchemaJSON,
	SchemaReference,
} from './schema.interface.ts';
import type {TypingAlias, TypingInterface} from './typing.interface.ts';

export interface EnvironmentJSON {
	schemas: SchemaJSON[];
}

export interface EnvironmentInterface<
	T extends TypingAlias = TypingAlias,
> {
	getTyping(): TypingInterface<T>;
	addSchema(schema: SchemaInterface);
	getSchema(ref: SchemaReference): SchemaInterface;
	getSchemas(): SchemaInterface[];

	toJSON(): EnvironmentJSON;
}
