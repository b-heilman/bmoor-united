import {isArray} from '@bmoor/compare';
import {create} from '@bmoor/error';
import {DynamicObject} from '@bmoor/object';
import {implode} from '@bmoor/path';

import {BuilderJSONSchema} from './builder/jsonschema';
import {BuilderJSONSchemaObject} from './builder/jsonschema.interface';
import {BuilderTypescript} from './builder/typescript';
import {ContextInterface} from './context.interface';
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
	ctx: ContextInterface;
	settings: SchemaJSON;
	fields: Record<FieldReference, FieldInterface>;
	relationships: Record<SchemaReference, RelationshipJSON>;

	constructor(schema: SchemaSettings) {
		this.settings = schema; // I'll probably change this later, but for now, is what it is

		const fields: FieldJSON[] = reduceStructure(schema.structure).map(
			(field) =>
				Object.assign(field, {
					info: schema.info[field.ref],
				}),
		);

		this.fields = fields.reduce((agg, fieldSchema, dex) => {
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
	}

	setContext(ctx: ContextInterface) {
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

	toTypescript(): string {
		const builder = new BuilderTypescript(this.ctx);

		builder.addSchema(this);

		return builder.toString();
	}
}
