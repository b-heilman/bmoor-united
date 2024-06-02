import {implode} from '@bmoor/object';

import {BuilderJSONSchema} from './builder/jsonschema';
import {BuilderJSONSchemaObject} from './builder/jsonschema.interface';
import {
	SchemaInterface,
	SchemaJSON,
	SchemaStructured,
} from './schema.interface';
import {TypingInterface} from './typing.interface';

export function fromStructureSchema(
	structured: SchemaStructured,
): SchemaJSON {
	const paths = implode(structured.structure);

	return {
		reference: structured.reference,
		fields: Object.entries(paths).map(([path, ref]) => ({
			ref,
			path,
			info: structured.info[ref],
		})),
		relationships: structured.relationships,
		validations: structured.validations,
	};
}

export function toJSONSchema(
	schema: SchemaInterface,
	typing: TypingInterface,
): BuilderJSONSchemaObject {
	const formatter = new BuilderJSONSchema(typing);

	for (const field of schema.getFields()) {
		formatter.addField(field);
	}

	return formatter.toJSON();
}

export function toBmoorSchema(schema: SchemaInterface): SchemaJSON {
	return {
		fields: schema.getFields().map((field) => ({
			ref: field.getReference(),
			info: field.getInfo(),
			path: field.getPath(),
		})),
	};
}
