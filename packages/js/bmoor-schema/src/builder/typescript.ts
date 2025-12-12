import {DynamicObject, set} from '@bmoor/object';
import {toCamelCase} from '@bmoor/string';

import {FieldNeed} from '../field.interface.ts';
import type {SchemaInterface} from '../schema.interface.ts';

export function dictToTypescript(
	root: DynamicObject,
	namespace: string,
): string {
	const children = [];
	const schema = [];

	for (const [key, value] of Object.entries(root)) {
		if (typeof value === 'object') {
			const child = toCamelCase(namespace + '_' + key);

			children.push(dictToTypescript(value, child));
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

export function generateTypescript(schema: SchemaInterface): string {
	const root = {};
	const name = toCamelCase(schema.getReference());

	for (const field of schema.getFields()) {
		const info = field.getInfo();

		let type;

		if ('mount' in info){
			type = toCamelCase(schema.getRelationship(info.mount).other.getReference());
		} else {
			type = schema.getTyping().getType(field.getType()).alias.typescript;
		}

		set(
			root,
			field.getPath() + (info.need === FieldNeed.optional ? '?' : ''),
			type + (info.need === FieldNeed.nullable ? '|null' : ''),
		);
	}

	return dictToTypescript(root, name);
}
