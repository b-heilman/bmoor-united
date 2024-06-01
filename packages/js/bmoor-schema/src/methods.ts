import {implode} from '@bmoor/object';

import {
	SchemaInterface,
	SchemaJSON,
	SchemaStructured,
} from './schema.interface';
import {TypingInterface} from './typing.interface';
import { FormatJSONSchema } from './format/jsonschema';
import { JSONSchemaObject } from './format/jsonschema.interface';

export function fromStructureSchema(
	structured: SchemaStructured,
): SchemaJSON {
	const paths = implode(structured.structure);

	return {
		fields: Object.entries(paths).map(([path, tag]) => ({
			tag,
			path,
			info: structured.info[tag],
		})),
	};
}

export function toJSONSchema(
	schema: SchemaInterface,
	typing: TypingInterface,
): JSONSchemaObject {
	const formatter = new FormatJSONSchema(typing);

	for (const field of schema.getFields()){
		formatter.addField(field);
	}

	return formatter.toJSON();
}

export function toBmoorSchema(
	schema: SchemaInterface,
): SchemaJSON {
	return {
		fields: schema.getFields().map((field) => ({
			tag: field.getReference(),
			info: field.getInfo(),
			path: field.getPath(),
		})),
	};
}
