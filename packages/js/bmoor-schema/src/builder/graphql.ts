import {DynamicObject, set} from '@bmoor/object';

import {ContextInterface} from '../context.interface';
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
	ctx: ContextInterface<BuilderGraphqlTypingJSON>;
	root: DynamicObject;

	constructor(ctx: ContextInterface<BuilderGraphqlTypingJSON>) {
		this.ctx = ctx;
		this.root = {};
	}

	addSchema(schema: SchemaInterface) {
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
				this.ctx.getTyping(info.type).graphql,
			);
		}
	}

	addRelationship(
		schema: SchemaInterface,
		relationship: RelationshipJSON,
	) {
		const other = this.ctx.getSchema(relationship.other);

		const attrs = relationship.otherFields.map((attr) => {
			const otherField = other.getField(attr);

			return `${otherField.getReference()}: ${this.ctx.getTyping(otherField.getInfo().type).graphql}`;
		});

		const attributes = attrs.join(', ');

		let result = other.getReference(); // this.ctx.formatName(other.name);
		if (relationship.type === 'toMany') {
			result = '[' + result + ']';
		}

		set(
			this.root,
			schema.getField(relationship.reference).getPath +
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
		return rootToGraphql(this.root);
	}
}
