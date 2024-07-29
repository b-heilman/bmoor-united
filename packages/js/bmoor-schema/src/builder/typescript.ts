import {DynamicObject, set} from '@bmoor/object';

import {ContextInterface} from '../context.interface';
import {FieldInterface} from '../field.interface';
import {Knowledge} from '../knowledge';
import {dictToTypescript} from '../methods';
import {RelationshipJSON} from '../relationship.interface';
import {SchemaInterface} from '../schema.interface';
import {TypingJSON} from '../typing.interface';

export class BuilderTypescript<TypingT extends TypingJSON = TypingJSON> {
	ctx: ContextInterface<TypingT>;
	root: DynamicObject;
	schema?: SchemaInterface;
	knowledge: Knowledge;

	constructor(ctx: ContextInterface<TypingT>, know: Knowledge) {
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
					(info.required || info.use === 'primary' ? '' : '?'),
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
