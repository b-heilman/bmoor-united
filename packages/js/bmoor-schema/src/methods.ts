import {isArray} from '@bmoor/compare';
import {DynamicObject} from '@bmoor/object';
import {implode} from '@bmoor/path';

import {BuilderJSONSchema} from './builder/jsonschema';
import {BuilderJSONSchemaObject} from './builder/jsonschema.interface';
import {ContextInterface} from './context.interface';
import {
	SchemaInterface,
	SchemaJSON,
	SchemaStructured,
} from './schema.interface';
import {TypingJSON} from './typing.interface';

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

export function toJSONSchema<T extends TypingJSON = TypingJSON>(
	ctx: ContextInterface<T>,
	schema: SchemaInterface,
): BuilderJSONSchemaObject {
	const formatter = new BuilderJSONSchema(ctx);

	formatter.addSchema(schema);

	return formatter.toJSON();
}

export function dictToGraphql(
	root: DynamicObject,
	indention = '',
): string {
	const children = indention + '\t';

	// TODO: subtypes are defined on the bottom
	return (
		'{\n' +
		Object.entries(root)
			.map(([key, value]) => children + key + ': ' + value)
			.join('\n') +
		'\n' +
		indention +
		'}'
	);
}
