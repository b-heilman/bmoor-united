import type {SchemaInterface} from '../schema.interface.ts';
import type {
	BuilderJSONSchemaNode,
	BuilderJSONSchemaObject,
} from './jsonschema.interface.ts';

export function generateJsonSchema(
	schema: SchemaInterface,
): BuilderJSONSchemaObject {
	const root: BuilderJSONSchemaObject = {
		type: 'object',
		properties: {},
	};

	for (const field of schema.getFields()) {
		const chain = field.getPathChain();

		let cur: BuilderJSONSchemaNode = root;

		for (const link of chain) {
			if ('properties' in cur) {
				const ref = link.reference; // this.ctx.formatName(link.reference, 'jsonschema');

				if (link.type === 'object') {
					if (!(ref in cur.properties)) {
						cur.properties[ref] = {
							type: 'object',
							properties: {},
						};
					}
				} else if (link.type === 'array') {
					if (!(ref in cur.properties)) {
						cur.properties[ref] = {
							type: 'array',
							items: {},
						};
					}
				} else {
					cur.properties[ref] = {
						type: schema.getTyping().getType(link.fieldType).alias.json,
					};
				}

				cur = cur.properties[ref];
			} else if ('items' in cur) {
				if (link.type === 'object') {
					if (!cur.items.type) {
						Object.assign(cur.items, {
							type: 'object',
							properties: {},
						});
					}

					cur = cur.items;
				} else if (link.type === 'array') {
					if (!cur.items.type) {
						Object.assign(cur.items, {
							type: 'array',
							items: {},
						});
					}

					cur = cur.items;
				} else {
					if (link.reference) {
						const ref = link.reference; // this.ctx.formatName(link.reference, 'jsonschema');
						if (!('properties' in cur.items)) {
							cur.items = {
								type: 'object',
								properties: {},
							};
						}

						cur = cur.items.properties[ref] = {
							type: schema.getTyping().getType(link.fieldType).alias.json,
						};
					} else {
						cur.items.type = schema
							.getTyping()
							.getType(link.fieldType).alias.json;
					}
				}
			}
		}
	}

	return root;
}
