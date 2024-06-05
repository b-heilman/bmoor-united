import {DynamicObject} from '@bmoor/object';

import {ConnectorJSON} from './connector.interface';
import {ContextInterface} from './context.interface';
import {Field} from './field';
import {FieldInterface, FieldReference, FieldUse} from './field.interface';
import {RelationshipJSON} from './relationship.interface';
import {
	SchemaInterface,
	SchemaJSON,
	SchemaReference,
	SchemaSettings,
} from './schema.interface';
import { create } from '@bmoor/error';

export class Schema implements SchemaInterface {
	settings: SchemaJSON;
	fields: Record<FieldReference, FieldInterface>;
	relationships: Record<SchemaReference, RelationshipJSON>;
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

		this.relationships = schema.relationships.reduce(
			(agg, relationship) => {
				agg[relationship.other] = relationship;

				return agg;
			},
			{}
		);

		if (this.settings.connection) {
			this.connection = this.settings.connection;
		}
	}

	getReference(): SchemaReference {
		return this.settings.reference;
	}

	getPrimaryField(): FieldInterface {
		const res = this.getFields().filter(field => field.getInfo().use === FieldUse.primary);

		if (res.length > 1){
			throw create('unable to have multiple primaries: '+this.getReference(), {
				code: 'BMS_SCHEMA_MULTIPLE_PRIMARIES'
			});
		}

		return res[0];
	}

	getFields(): FieldInterface[] {
		return Object.values(this.fields);
	}

	getField(ref: FieldReference): FieldInterface {
		return this.fields[ref];
	}

	getRelationships(): RelationshipJSON[] {
		return Object.values(this.relationships);
	}

	getRelationship(other: SchemaReference): RelationshipJSON {
		return this.relationships[other];
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
