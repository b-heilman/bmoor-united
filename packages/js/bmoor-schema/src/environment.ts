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

export class Environment<
	SchemaT extends SchemaInterface = SchemaInterface,
> implements EnvironmentInterface<SchemaT> {
	schemas: Record<SchemaReference, SchemaT>;

	constructor() {
		this.schemas = {};
	}

	addSchema(schema: SchemaT) {
		const ref = schema.getReference();

		if (!ref) {
			throw create('Schemas in Knowledge must have reference', {
				code: 'BMS_Knowledge_UNNAMED_SCHEMA',
			});
		}

		schema.setEnvironment(this);

		this.schemas[ref] = schema;
	}

	getSchema(ref: SchemaReference): SchemaT {
		return this.schemas[ref];
	}

	getSchemas(): SchemaT[] {
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
