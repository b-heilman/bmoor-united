import {DynamicObject, set} from '@bmoor/object';
import {ContextInterface} from '@bmoor/schema/src/context.interface';
import {FieldInterface} from '@bmoor/schema/src/field.interface';
import {dictToGraphql} from '@bmoor/schema/src/methods';
import {RelationshipJSON} from '@bmoor/schema/src/relationship.interface';
import {SchemaInterface} from '@bmoor/schema/src/schema.interface';
import {TypingJSON} from '@bmoor/schema/src/typing.interface';

// TODO: I need to handle multiple dimensions and sub types

export class BuilderGraphql<TypingT extends TypingJSON = TypingJSON> {
	ctx: ContextInterface<TypingT>;
	root: DynamicObject;
	schema?: SchemaInterface;

	constructor(ctx: ContextInterface<TypingT>) {
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
						return `${action}: ${this.ctx.getTyping(type).graphql}`;
					},
				),
			);

		const attributes = attrs.join(', ');

		let result = this.ctx.formatName(other.getReference(), 'graphql');
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
		const name = this.ctx.formatName(
			this.schema?.getReference() || '__replace__',
			'graphql',
		);

		return dictToGraphql(this.ctx, this.root, name);
	}
}
