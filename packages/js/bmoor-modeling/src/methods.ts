import {DynamicObject} from '@bmoor/object';
import {SchemaFormatInterface} from '@bmoor/schema';

export function dictToGraphql(
	ctx: SchemaFormatInterface,
	root: DynamicObject,
	namespace: string,
): string {
	const children = [];
	const schema = [];

	for (const [key, value] of Object.entries(root)) {
		if (typeof value === 'object') {
			const child = ctx.formatName(namespace + '_' + key, 'typescript');

			children.push(dictToGraphql(ctx, value, child));
			schema.push(key + ': ' + child);
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
