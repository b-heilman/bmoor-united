import {create} from '@bmoor/error';
import {toCamelCase} from '@bmoor/string';

import {
	EnvironmentInterface,
	EnvironmentJSON,
} from './environment.interface.ts';
import type {
	SchemaInterface,
	SchemaReference,
} from './schema.interface.ts';
import type {TypingAlias, TypingInterface} from './typing.interface.ts';

export class Environment<
	TypingT extends TypingAlias = TypingAlias,
> implements EnvironmentInterface<TypingT> {
	typing: TypingInterface<TypingT>;
	schemas: Record<SchemaReference, SchemaInterface>;

	constructor(
		typing: TypingInterface<TypingT>,
		schemas?: SchemaInterface[],
	) {
		this.typing = typing;
		this.schemas = {};

		if (schemas) {
			for (const schema of schemas) {
				this.addSchema(schema);
			}
		}
	}

	getTyping(): TypingInterface<TypingT> {
		return this.typing;
	}

	addSchema(schema: SchemaInterface) {
		const ref = schema.getReference();

		if (!ref) {
			throw create('Schemas in and evironment must have reference', {
				code: 'BMS_Knowledge_UNNAMED_SCHEMA',
			});
		}

		this.schemas[ref] = schema;
	}

	getSchema(ref: SchemaReference): SchemaInterface {
		return this.schemas[ref];
	}

	getSchemas(): SchemaInterface[] {
		return Object.values(this.schemas);
	}

	formatName(ref: string): string {
		return toCamelCase(ref);
	}

	toJSON(): EnvironmentJSON {
		return {
			schemas: Object.values(this.schemas).map((schema) =>
				schema.toJSON(),
			),
		};
	}
}
