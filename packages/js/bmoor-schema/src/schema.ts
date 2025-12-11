import {isArray} from '@bmoor/compare';
import {DynamicObject} from '@bmoor/object';
import {implode} from '@bmoor/path';

import {EnvironmentInterface} from './environment.interface.ts';
import {Environment} from './environment.ts';
import type {
	FieldInterface,
	FieldJSON,
	FieldReference,
} from './field.interface.ts';
import {Field} from './field.ts';
import type {RelationshipJSON} from './relationship.interface.ts';
import type {
	SchemaFieldSet,
	SchemaInterface,
	SchemaJSON,
	SchemaReference,
	SchemaSettings,
	SchemaStructure,
} from './schema.interface.ts';
import type {TypingInterface, TypingJSON} from './typing.interface.ts';

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

export class Schema<
	TypingT extends TypingJSON = TypingJSON,
> implements SchemaInterface<TypingT> {
	typing: TypingInterface<TypingT>;
	env: Environment;
	fields: Record<FieldReference, FieldInterface>;
	settings: SchemaJSON;
	relationships: Record<SchemaReference, RelationshipJSON>;

	constructor(typing: TypingInterface<TypingT>, schema: SchemaSettings) {
		this.typing = typing;
		this.settings = schema; // I'll probably change this later, but for now, is what it is
		this.fields = this.defineFields();
		this.relationships = this.defineRelationships();
	}

	setEnvironment(env: Environment) {
		this.env = env;
	}

	getTyping(): TypingInterface<TypingT> {
		return this.typing;
	}

	getEnvironment(): EnvironmentInterface {
		return this.env;
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
			(field) => {
				const info = field.getInfo();
				if ('primary' in info){
					return info.primary;
				} else {
					return false;
				}
			}
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

	toJSON(): SchemaJSON {
		return this.settings;
	}
}
