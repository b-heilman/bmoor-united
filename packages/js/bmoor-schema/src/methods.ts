import {isArray} from '@bmoor/compare';
import {implode} from '@bmoor/path';

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
		fields: Object.entries(paths).map(([path, reference]) => {
			let ref: string;

			if (isArray(reference)) {
				ref = reference[0];
			} else {
				ref = <string>reference;
			}

			return {
				ref,
				path,
				info: structured.info[ref],
			};
		}),
		relationships: structured.relationships,
		validators: structured.validators,
		connection: structured.connection,
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
