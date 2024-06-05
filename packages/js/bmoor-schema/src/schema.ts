import {DynamicObject} from '@bmoor/object';

import {ConnectorJSON} from './connector.interface';
import {ContextInterface} from './context.interface';
import {Field} from './field';
import {FieldInterface, FieldReference} from './field.interface';
import {RelationshipJSON} from './relationship.interface';
import {
	SchemaInterface,
	SchemaJSON,
	SchemaReference,
	SchemaSettings,
} from './schema.interface';

export class Schema implements SchemaInterface {
	settings: SchemaJSON;
	fields: Record<FieldReference, FieldInterface>;
	relationships: RelationshipJSON[];
	connection: ConnectorJSON;

	constructor(schema: SchemaSettings) {
		this.settings = schema; // I'll probably change this later, but for now, is what it is
		this.fields = schema.fields.reduce((agg, fieldSchema, dex) => {
			const field = new Field(fieldSchema);
			const ref = field.getReference() || 'field_' + dex;

			agg[ref] = field;

			if (schema.validators) {
				const validator = schema.validators[ref];
				if (validator) {
					field.setValidator(validator);
				}
			}

			return agg;
		}, {});

		this.relationships = schema.relationships;

		if (this.settings.connection) {
			this.connection = this.settings.connection;
		}
	}

	getReference(): SchemaReference {
		return this.settings.reference;
	}

	getFields(): FieldInterface[] {
		return Object.values(this.fields);
	}

	getField(ref: FieldReference): FieldInterface {
		return this.fields[ref];
	}

	implode(root: DynamicObject): DynamicObject {
		const rtn = {};

		for (const [key, field] of Object.entries(this.fields)) {
			rtn[key] = field.read(root);
		}

		return rtn;
	}

	explode(root: DynamicObject): DynamicObject {
		const rtn = {};

		for (const [key, field] of Object.entries(this.fields)) {
			field.write(rtn, root[key]);
		}

		return rtn;
	}

	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	async read(ctx: ContextInterface, select: any): Promise<any[]> {
		const connector = ctx.getConnector(this.connection.connector);

		return connector(select);
	}

	toJSON(): SchemaJSON {
		return this.settings;
	}
}
