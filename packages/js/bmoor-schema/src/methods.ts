import {DynamicObject} from '@bmoor/object';

import {BuilderJSONSchemaObject} from './builder/jsonschema.interface.ts';
import {BuilderJSONSchema} from './builder/jsonschema.ts';
import {SchemaInterface} from './schema.interface.ts';
import {
	SchemaContextInterface,
	SchemaFormatInterface,
} from './schema/context.interface.ts';
import {TypingJSON} from './typing.interface.ts';

export function toJSONSchema<T extends TypingJSON = TypingJSON>(
	ctx: SchemaContextInterface<T>,
	schema: SchemaInterface,
): BuilderJSONSchemaObject {
	const formatter = new BuilderJSONSchema(ctx);

	formatter.addSchema(schema);

	return formatter.toJSON();
}

export function dictToTypescript(
	ctx: SchemaFormatInterface,
	root: DynamicObject,
	namespace: string,
): string {
	const children = [];
	const schema = [];

	for (const [key, value] of Object.entries(root)) {
		if (typeof value === 'object') {
			const child = ctx.formatName(namespace + '_' + key, 'typescript');

			children.push(dictToTypescript(ctx, value, child));
			schema.push(key + ': ' + child);
		} else {
			schema.push(key + ': ' + value);
		}
	}

	let content = `interface ${namespace} {\n\t${schema.join('\n\t')}\n}`;

	if (children.length) {
		content = content + '\n' + children.join('\n');
	}

	return content;
}
