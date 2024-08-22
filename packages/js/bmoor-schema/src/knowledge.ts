import {create} from '@bmoor/error';
import {DynamicObject} from '@bmoor/object';
import {toCamelCase} from '@bmoor/string';

import {KnowledgeInterface, KnowledgeJSON} from './knowledge.interface';
import {SchemaInterface, SchemaReference} from './schema.interface';

export class Knowledge<SchemaT extends SchemaInterface = SchemaInterface>
	implements KnowledgeInterface<SchemaT>
{
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

		schema.setSpace(this);

		this.schemas[ref] = schema;
	}

	getSchema(ref: SchemaReference): SchemaT {
		return this.schemas[ref];
	}

	getSchemas(): SchemaT[] {
		return Object.values(this.schemas);
	}

	async validate(
		ref: SchemaReference,
		root: DynamicObject,
		mode: 'create' | 'update' = 'create',
	): Promise<string[]> {
		return this.getSchema(ref).validate(root, mode);
	}

	formatName(ref: string): string {
		return toCamelCase(ref);
	}

	toJSON(): KnowledgeJSON {
		return {
			schemas: Object.values(this.schemas).map((schema) =>
				schema.toJSON(),
			),
		};
	}
}
