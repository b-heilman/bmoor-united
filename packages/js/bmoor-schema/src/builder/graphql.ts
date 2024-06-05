import { DynamicObject, set } from '@bmoor/object';

import {ContextInterface} from '../context.interface';
import {FieldInterface, FieldReference, FieldUse} from '../field.interface';
import { RelationshipJSON, RelationshipType } from '../relationship.interface';
import {SchemaInterface} from '../schema.interface';
import {TypingInterface} from '../typing.interface';
import {
    BuilderGraphqlTypingJSON,
} from './graphql.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rootToGraphql(root: DynamicObject, indention = ''): string {
	const children = indention + '\t';

	return (
		'{\n' +
		Object.entries(root).map(([key, value]) => children + key + ': ' + value).join('\n') +
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

        if (info.use !== FieldUse.synthetic){
            set(this.root, field.getPath(), this.ctx.getTyping(info.type).graphql);
        }
	}

    addRelationship(schema: SchemaInterface, relationship: RelationshipJSON) {
        const ref = relationship.reference;
		const other = this.ctx.getSchema(relationship.other);
		
        let attrs = relationship.otherFields.map(
			(attr) => {
                const otherField = other.getField(attr);

                return `${otherField.getReference()}: ${this.ctx.getTyping(otherField.getInfo().type).graphql}`;
            }
		);

		const attributes = attrs.join(', ');

        let result = other.getReference()// this.ctx.formatName(other.name);
		if (relationship.type === RelationshipType.toMany) {
			result = '[' + result + ']';
		}

		set(this.root, schema.getField(relationship.reference).getPath + '(' + attributes + ')', result);
    }

	toJSON() {
		return this.root;
	}

    toString() {
        return rootToGraphql(this.root);
    }
}

/**
export class Field {
	info: FieldJSON;

	constructor(field: FieldJSON) {
		this.info = field;
	}

	buildGraphQL(
		ctx: GraphQlContext,
		agg: Record<string, string | Record<string, string>>
	) {
		set(agg, this.info.path, ctx.types[this.info.type]);
	}
}

export class Relationship {
	info: RelationshipJSON;

	constructor(relationship: RelationshipJSON) {
		this.info = relationship;
	}

	buildGraphQL(
		ctx: GraphQlContext,
		agg: Record<string, string | Record<string, string>>
	) {
		const name = this.info.name;
		const other = ctx.schemas[this.info.toSchema];
		// This isn't neccisarily true.  We might not want users to be able
		// to filter on all join fields, which this allows
		let attrBuilder = this.info.toPaths.map(
			(attr) => `${attr}: ${ctx.types[other.fields[attr].info.type]}`
		);

		// TODO: key as well as join fields
		attrBuilder.unshift('id: String');

		if (other.actions) {
			attrBuilder = attrBuilder.concat(
				Object.entries(other.actions).map(
					([attr, type]) => `${attr}: ${ctx.types[type]}`
				)
			);
		}

		const attributes = attrBuilder.join(', ');
		let response = ctx.formatName(other.name);
		if (this.info.type === RelationshipType.toMany) {
			response = '[' + response + ']';
		}

		set(agg, name + '(' + attributes + ')', response);
	}
}

toGraphQL(ctx: GraphQlContext): string {
    const agg: Record<string, string | Record<string, string>> = {};

    Object.values(this.fields).forEach((field) =>
        field.buildGraphQL(ctx, agg)
    );

    Object.values(this.relationships).forEach((rel) =>
        rel.buildGraphQL(ctx, agg)
    );

    const reduced = generateTypes(ctx.formatName(this.name), agg);

    const types = Object.entries(reduced)
        .map(([name, fields]) => `\ttype ${name} ${toString(fields, '\t')}`)
        .join('\n');

    return (
        `#--- generation begin: ${this.name}---` +
        `\n${types}\n` +
        '#--- generation end ---'
    );
}
 */