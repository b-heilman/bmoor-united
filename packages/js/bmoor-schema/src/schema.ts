import {isArray} from '@bmoor/compare';
import {DynamicObject} from '@bmoor/object';
import {implode} from '@bmoor/path';

import type {
	FieldInterface,
	FieldJSON,
	FieldReference,
} from './field.interface.ts';
import {Field} from './field.ts';
import type {
	SchemaFieldSet,
	SchemaInterface,
	SchemaJSON,
	SchemaReference,
	SchemaSettings,
	SchemaStructure,
} from './schema.interface.ts';

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
	fields: Record<FieldReference, FieldInterface>;
	settings: SchemaJSON;

	constructor(schema: SchemaSettings) {
		this.settings = schema; // I'll probably change this later, but for now, is what it is
		this.fields = this.defineFields();
	}

	defineFields(): Record<FieldReference, FieldInterface> {
		const schema = this.settings;
		const fields: FieldJSON[] = reduceStructure(schema.structure).map(
			(field) =>
				Object.assign(field, {
					info: schema.info[field.ref],
				}),
		);

		return fields.reduce((agg, fieldSchema, dex) => {
			const field = new Field(fieldSchema);
			const ref = field.getReference() || 'field_' + dex;

			// TODO: I should make sure all types are actually defined
			agg[ref] = field;

			return agg;
		}, {});
	}

	getReference(): SchemaReference {
		return this.settings.reference;
	}

	getPrimaryFields(): FieldInterface[] {
		return this.getFields().filter((field) => {
			const info = field.getInfo();
			if ('primary' in info) {
				return info.primary;
			} else {
				return false;
			}
		});
	}

	getMountFields(): FieldInterface[] {
		return this.getFields().filter((field) => {
			const info = field.getInfo();
			return 'mount' in info;
		});
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

	toJSON(): SchemaJSON {
		return this.settings;
	}
}
