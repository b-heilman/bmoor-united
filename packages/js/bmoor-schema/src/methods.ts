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
	namespace: string,
): string {
	const children = [];
	const schema = [];

	let counter = 0;

	for (const [key, value] of Object.entries(root)) {
		if (typeof value === 'object') {
			const child = namespace + '_' + counter;

			children.push(dictToGraphql(value, child));
			schema.push(key + ': ' + child);

			counter++;
		} else {
			schema.push(key + ': ' + value);
		}
	}

	let content = `type ${namespace} {\n\t${schema.join('\n\t')}\n}`;

	if (children.length) {
		content = content + '\n' + children.join('\n');
	}

	return content;
}
