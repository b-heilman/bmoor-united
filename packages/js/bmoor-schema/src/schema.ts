import {isArray} from '@bmoor/compare';
import {DynamicObject} from '@bmoor/object';
import {implode} from '@bmoor/path';

import {BuilderJSONSchema} from './builder/jsonschema';
import {BuilderJSONSchemaObject} from './builder/jsonschema.interface';
import {BuilderTypescript} from './builder/typescript';
import {EnvironmentContext} from './environment/context';
import {Field} from './field';
import {
	FieldInterface,
	FieldJSON,
	FieldReference,
} from './field.interface';
import {RelationshipJSON} from './relationship.interface';
import {
	SchemaFieldSet,
	SchemaInterface,
	SchemaJSON,
	SchemaReference,
	SchemaSettings,
	SchemaStructure,
} from './schema.interface';
import {SchemaContextInterface} from './schema/context.interface';

export function reduceStructure(
	structure: SchemaStructure,
): SchemaFieldSet {
	if (Array.isArray(structure)) {
		return structure;
	} else {
		const paths = implode(structure);
		return Object.entries(paths).map(([path, reference]) => {
			let ref: string;

			if (isArray(reference)) {
				ref = reference[0];
			} else {
				ref = <string>reference;
			}

			return {
				ref,
				path,
			};
		});
	}
}

export class Schema implements SchemaInterface {
	ctx: SchemaContextInterface;
	env: EnvironmentContext;
	fields: Record<FieldReference, FieldInterface>;
	settings: SchemaJSON;
	relationships: Record<SchemaReference, RelationshipJSON>;

	constructor(ctx: SchemaContextInterface, schema: SchemaSettings) {
		this.ctx = ctx;
		this.settings = schema; // I'll probably change this later, but for now, is what it is

		this.fields = this.defineFields();
		this.relationships = this.defineRelationships();
	}

	setSpace(env: EnvironmentContext) {
		this.env = env;
	}

	defineFields(): Record<FieldReference, FieldInterface> {
		const schema = this.settings;
		// TODO: verify types here?
		const fields: FieldJSON[] = reduceStructure(schema.structure).map(
			(field) =>
				Object.assign(field, {
					info: schema.info[field.ref],
				}),
		);

		return fields.reduce((agg, fieldSchema, dex) => {
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
	}

	defineRelationships(): Record<SchemaReference, RelationshipJSON> {
		const schema = this.settings;

		if (schema.relationships) {
			return schema.relationships.reduce((agg, relationship) => {
				agg[relationship.other] = relationship;

				return agg;
			}, {});
		} else {
			return {};
		}
	}

	getReference(): SchemaReference {
		return this.settings.reference;
	}

	getPrimaryFields(): FieldInterface[] {
		return this.getFields().filter(
			(field) => field.getInfo().use === 'primary',
		);
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

	async validate(
		root: DynamicObject,
		mode: 'create' | 'update' = 'create',
	): Promise<string[]> {
		return (
			await Promise.all(
				this.getFields().map((field) =>
					field.validate(this.ctx, root, mode),
				),
			)
		).filter((error) => error !== null);
	}

	toJSON(): SchemaJSON {
		return this.settings;
	}

	toJSONSchema(): BuilderJSONSchemaObject {
		const builder = new BuilderJSONSchema(this.ctx);

		builder.addSchema(this);

		return builder.toJSON();
	}

	toTypescript(): string {
		const builder = new BuilderTypescript(this.ctx, this.env);

		builder.addSchema(this);

		return builder.toString();
	}
}
