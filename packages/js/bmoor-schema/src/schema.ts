import {create} from '@bmoor/error';
import {DynamicObject} from '@bmoor/object';

import {BuilderGraphql} from './builder/graphql';
import {BuilderJSONSchema} from './builder/jsonschema';
import {BuilderJSONSchemaObject} from './builder/jsonschema.interface';
import {BuilderTypescript} from './builder/typescript';
import {
	ConnectionActionsType,
	ConnectionJSON,
} from './connection.interface';
import {ConnectorContextInterface} from './connector/context.interface';
import {Field} from './field';
import {FieldInterface, FieldReference} from './field.interface';
import {RelationshipJSON} from './relationship.interface';
import {
	SchemaInterface,
	SchemaJSON,
	SchemaReference,
	SchemaSettings,
} from './schema.interface';

export class Schema<
	ActionsT extends ConnectionActionsType = ConnectionActionsType,
> implements SchemaInterface<ActionsT>
{
	ctx: ConnectorContextInterface;
	settings: SchemaJSON<ActionsT>;
	fields: Record<FieldReference, FieldInterface>;
	relationships: Record<SchemaReference, RelationshipJSON>;
	connection: ConnectionJSON<ActionsT>;

	constructor(schema: SchemaSettings<ActionsT>) {
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

		if (schema.relationships) {
			this.relationships = schema.relationships.reduce(
				(agg, relationship) => {
					agg[relationship.other] = relationship;

					return agg;
				},
				{},
			);
		} else {
			this.relationships = {};
		}

		if (this.settings.connection) {
			this.connection = this.settings.connection;
		}
	}

	setContext(ctx: ConnectorContextInterface) {
		this.ctx = ctx;
	}

	getReference(): SchemaReference {
		return this.settings.reference;
	}

	getPrimaryField(): FieldInterface {
		const res = this.getFields().filter(
			(field) => field.getInfo().use === 'primary',
		);

		if (res.length > 1) {
			throw create(
				'unable to have multiple primaries: ' + this.getReference(),
				{
					code: 'BMS_SCHEMA_MULTIPLE_PRIMARIES',
				},
			);
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

	getConnectionActions(): ActionsT {
		return this.connection?.actions;
	}

	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	async read(ctx: ConnectorContextInterface, select: any): Promise<any[]> {
		const connection = ctx.getConnection(this.connection.reference);

		return connection(select);
	}

	async validate(
		root: DynamicObject,
		mode: 'create' | 'update' = 'create',
	): Promise<string[]> {
		const rtn = (
			await Promise.all(
				this.getFields().map((field) =>
					field.validate(this.ctx, root, mode),
				),
			)
		).filter((error) => error !== null);

		if (rtn.length === 0) {
			return null;
		} else {
			return rtn;
		}
	}

	toJSON(): SchemaJSON {
		return this.settings;
	}

	toJSONSchema(): BuilderJSONSchemaObject {
		const builder = new BuilderJSONSchema(this.ctx);

		builder.addSchema(this);

		return builder.toJSON();
	}

	toGraphql(): string {
		const builder = new BuilderGraphql(this.ctx);

		builder.addSchema(this);

		return builder.toString();
	}

	toTypescript(): string {
		const builder = new BuilderTypescript(this.ctx);

		builder.addSchema(this);

		return builder.toString();
	}
}
