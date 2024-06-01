import {FieldInterface} from '../field.interface';
import {SchemaInterface} from '../schema.interface';
import {TypingInterface} from '../typing.interface';
import {JSONSchemaNode, JSONSchemaObject} from './jsonschema.interface';

export class FormatJSONSchema {
	root: JSONSchemaObject;
	typing: TypingInterface;

	constructor(typing: TypingInterface) {
        this.typing = typing;
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
		const chain = field.getPathChain();

		let cur: JSONSchemaNode = this.root;

		for (const link of chain) {
			if ('properties' in cur) {
				if (link.type === 'object') {
					if (!(link.reference in cur.properties)) {
						cur.properties[link.reference] = {
							type: 'object',
							properties: {},
						};
					}
				} else if (link.type === 'array') {
					if (!(link.reference in cur.properties)) {
						cur.properties[link.reference] = {
							type: 'array',
							items: {},
						};
					}
				} else {
					cur.properties[link.reference] = {
						type: this.typing.getType(link.fieldType).json,
					};
				}

                cur = cur.properties[link.reference];
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
                    if (link.reference){
                        if (!('properties' in cur.items)){
                            cur.items = {
                                type: 'object',
                                properties: {},
                            };
                        }

                        cur = cur.items.properties[link.reference] = {
                            type: this.typing.getType(link.fieldType).json
                        };
                    } else {
                        cur.items.type = this.typing.getType(link.fieldType).json;
                    }
				}
			}
		}
	}

	toJSON() {
		return this.root;
	}
}
