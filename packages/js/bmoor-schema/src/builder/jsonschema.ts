import {FieldInterface} from '../field.interface';
import {SchemaInterface} from '../schema.interface';
import {SchemaContextInterface} from '../schema/context.interface';
import {
	BuilderJSONSchemaNode,
	BuilderJSONSchemaObject,
} from './jsonschema.interface';

export class BuilderJSONSchema {
	ctx: SchemaContextInterface;
	root: BuilderJSONSchemaObject;

	constructor(ctx: SchemaContextInterface) {
		this.ctx = ctx;
		this.root = {
			type: 'object',
			properties: {},
		};
	}

	addSchema(schema: SchemaInterface) {
		for (const field of schema.getFields()) {
			this.addField(field);
		}
	}

	addField(field: FieldInterface) {
		// For now, I'm not supporting synthetic fields
		if (field.getInfo().use === 'synthetic') {
			return;
		}

		const chain = field.getPathChain();

		let cur: BuilderJSONSchemaNode = this.root;

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
						type: this.ctx.getTyping(link.fieldType).json,
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
							type: this.ctx.getTyping(link.fieldType).json,
						};
					} else {
						cur.items.type = this.ctx.getTyping(link.fieldType).json;
					}
				}
			}
		}
	}

	toJSON() {
		return this.root;
	}
}
