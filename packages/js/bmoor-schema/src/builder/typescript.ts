import {DynamicObject, set} from '@bmoor/object';

import type {EnvironmentContextInterface} from '../environment/context.interface.ts';
import type {FieldInterface} from '../field.interface.ts';
import {FieldNeed} from '../field.interface.ts';
import {dictToTypescript} from '../methods.ts';
import type {RelationshipJSON} from '../relationship.interface.ts';
import type {SchemaInterface} from '../schema.interface.ts';
import type {SchemaContextInterface} from '../schema/context.interface.ts';
import type {TypingJSON} from '../typing.interface.ts';

export class BuilderTypescript<TypingT extends TypingJSON = TypingJSON> {
	ctx: SchemaContextInterface<TypingT>;
	root: DynamicObject;
	schema?: SchemaInterface;
	knowledge: EnvironmentContextInterface;

	constructor(
		ctx: SchemaContextInterface<TypingT>,
		know: EnvironmentContextInterface,
	) {
		this.ctx = ctx;
		this.root = {};
		this.knowledge = know;
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
				field.getPath() +
					(info.need === FieldNeed.optional ? '?' : ''),
				this.ctx.getTyping(info.type).typescript,
			);
		}
	}

	addRelationship(
		schema: SchemaInterface,
		relationship: RelationshipJSON,
	) {
		const other = this.knowledge.getSchema(relationship.other);

		let result = this.ctx.formatName(other.getReference(), 'typescript');
		if (relationship.type === 'toMany') {
			result = result + '[]';
		}

		set(
			this.root,
			schema.getField(relationship.reference).getPath(),
			result,
		);
	}

	toJSON() {
		return this.root;
	}

	toString() {
		const name = this.ctx.formatName(
			this.schema?.getReference() || '__replace__',
			'typescript',
		);

		return dictToTypescript(this.ctx, this.root, name);
	}
}
