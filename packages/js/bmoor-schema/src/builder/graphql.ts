import {DynamicObject, set} from '@bmoor/object';

import {ConnectorContextInterface} from '../connector/context.interface';
import {FieldInterface} from '../field.interface';
import {RelationshipJSON} from '../relationship.interface';
import {SchemaInterface} from '../schema.interface';
import {BuilderGraphqlTypingJSON} from './graphql.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rootToGraphql(root: DynamicObject, indention = ''): string {
	const children = indention + '\t';

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

export class BuilderGraphql {
	ctx: ConnectorContextInterface<BuilderGraphqlTypingJSON>;
	root: DynamicObject;
	schema?: SchemaInterface;

	constructor(ctx: ConnectorContextInterface<BuilderGraphqlTypingJSON>) {
		this.ctx = ctx;
		this.root = {};
	}

	addSchema(schema: SchemaInterface) {
		this.schema = schema;
		for (const field of schema.getFields()) {
			this.addField(field);
		}

		for (const relationship of schema.getRelationships()) {
			this.addRelationship(schema, relationship);
		}
	}

	addField(field: FieldInterface) {
		const info = field.getInfo();

		if (info.use !== 'synthetic') {
			set(
				this.root,
				field.getPath(),
				info.use === 'primary'
					? 'ID!'
					: this.ctx.getTyping(info.type).graphql +
							(info.required ? '!' : ''),
			);
		}
	}

	addRelationship(
		schema: SchemaInterface,
		relationship: RelationshipJSON,
	) {
		const other = this.ctx.getSchema(relationship.other);

		const attrs = relationship.otherFields
			.map((attr) => {
				// TODO: I need to handle filters...
				const otherField = other.getField(attr);

				return `${otherField.getReference()}: ${this.ctx.getTyping(otherField.getInfo().type).graphql}`;
			})
			.concat(
				Object.entries(other.getConnectionActions() || {}).map(
					([action, type]) => {
						return `${action}: ${this.ctx.getTyping(<string>type).graphql}`;
					},
				),
			);

		const attributes = attrs.join(', ');

		let result = other.getReference(); // this.ctx.formatName(other.name);
		if (relationship.type === 'toMany') {
			result = '[' + result + ']';
		}

		set(
			this.root,
			schema.getField(relationship.reference).getPath() +
				'(' +
				attributes +
				')',
			result,
		);
	}

	toJSON() {
		return this.root;
	}

	toString() {
		const graphql = rootToGraphql(this.root);
		if (this.schema) {
			// TODO: a way to format the name...
			return (
				'type ' +
				this.schema.getReference() +
				' ' +
				rootToGraphql(this.root)
			);
		} else {
			return graphql;
		}
	}
}
