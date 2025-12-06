import {DynamicObject, set} from '@bmoor/object';
import {
	FieldInterface,
	RelationshipJSON,
	SchemaInterface,
} from '@bmoor/schema';

import type {EnvironmentContextInterface} from '../environment/context.interface.ts';
import {dictToGraphql} from '../methods.ts';
import type {ModelContextInterface} from '../model/context.interface.ts';
import type {TypingJSON} from '../typing.interface.ts';

// TODO: I need to handle multiple dimensions and sub types

export class BuilderGraphql<TypingT extends TypingJSON = TypingJSON> {
	ctx: ModelContextInterface<TypingT>;
	root: DynamicObject;
	env: EnvironmentContextInterface;
	schema?: SchemaInterface;

	constructor(
		ctx: ModelContextInterface<TypingT>,
		env: EnvironmentContextInterface,
	) {
		this.ctx = ctx;
		this.root = {};
		this.env = env;
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
		const service = this.env.getService(relationship.other);
		const model = service.getModel();

		const attrs = relationship.otherFields
			.map((attr) => {
				// TODO: I need to handle filters...
				const otherField = model.getField(attr);

				return `${otherField.getReference()}: ${this.ctx.getTyping(otherField.getInfo().type).graphql}`;
			})
			.concat(
				Object.entries(service.getSelectActionTypes() || {}).map(
					([action, type]) => {
						return `${action}: ${this.ctx.getTyping(type).graphql}`;
					},
				),
			);

		const attributes = attrs.join(', ');

		let result = this.ctx.formatName(model.getReference(), 'graphql');
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
