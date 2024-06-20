import {
	BuilderGraphql,
	ConnectorContextInterface,
	DictionaryInterface,
	SchemaInterface,
	TypingJSON,
	dictToGraphql,
} from '@bmoor/schema';

import {
	GraphqlGenericType,
	GraphqlJSON,
	GraphqlSchemaResolvers,
	GraphqlSchemaSynthetics,
} from './graphql.interface';

function createSchemaResolver(
	ctx: ConnectorContextInterface,
	schema: SchemaInterface,
): GraphqlSchemaSynthetics {
	return schema.getRelationships().reduce(
		(agg, relationship) => {
			const other = ctx.getSchema(relationship.other);

			// TODO: I need to test this, I don't think it's right way to plug in, need to test
			//   with a '.' in the path.
			agg[schema.getField(relationship.reference).getPath()] = async (
				src: GraphqlGenericType,
				actions: GraphqlGenericType,
			) => {
				// This is the code that runs to process joins
				const properties = relationship.otherFields.reduce(
					(mappedArgs, targetRef, i) => {
						const srcField = schema.getField(relationship.fields[i]);
						const targetField = other.getField(targetRef);

						targetField.write(mappedArgs, srcField.read(src));

						return mappedArgs;
					},
					{},
				);

				const res = await other.read(ctx, {properties, actions});

				return relationship.type === 'toMany' ? res : res[0];
			};

			return agg;
		},
		<GraphqlSchemaSynthetics>{},
	);
}

export class Graphql<
	TypingT extends TypingJSON,
	SchemaT extends SchemaInterface,
> {
	settings: GraphqlJSON<TypingT, SchemaT>;
	dictionary: DictionaryInterface<TypingT, SchemaT>;

	constructor(
		dictionary: DictionaryInterface<TypingT, SchemaT>,
		settings: GraphqlJSON<TypingT, SchemaT>,
	) {
		this.settings = settings;
		this.dictionary = dictionary;
	}

	toString(): string {
		const types = Object.values(this.dictionary.getSchemas())
			.map((schema) => {
				const builder = new BuilderGraphql<TypingT>(this.dictionary);

				builder.addSchema(schema);

				return builder.toString();
			})
			.join('\n');

		const queries = Object.entries(this.settings.query).reduce(
			(agg, [key, query]) => {
				const schema = this.dictionary.getSchema(query.schema);

				const type = this.dictionary.formatName(
					schema.getReference(),
					'graphql',
				);
				const single = query.single || false;

				const primary = schema.getPrimaryField();
				const primaryType = this.dictionary.getTyping(
					primary.getInfo().type,
				).graphql;
				const params = [
					`${primary.getReference()}: ${primaryType}!`,
				].concat(
					Object.entries(schema.getConnectionActions() || {}).map(
						([action, type]) => {
							return `${action}: ${this.dictionary.getTyping(type).graphql}`;
						},
					),
				);

				agg[`${key}(${params.join(', ')})`] = single ? type : `[${type}]`;

				return agg;
			},
			{},
		);

		let custom = '';
		if (this.settings.customTypes) {
			custom =
				Object.keys(this.settings.customTypes)
					.map((type) => 'scalar ' + type)
					.join('\n') + '\n';
		}

		return `${custom}${types}\n${dictToGraphql(this.dictionary, queries, 'Query')}`;
	}

	toResolvers(): GraphqlSchemaResolvers {
		const resolvers: GraphqlSchemaResolvers = {};

		// Add the collection resolvers
		Object.values(this.dictionary.getSchemas()).reduce((agg, schema) => {
			const resolvers = createSchemaResolver(this.dictionary, schema);

			if (Object.keys(resolvers).length > 0) {
				agg[this.dictionary.formatName(schema.getReference(), 'graphql')] =
					resolvers;
			}

			return agg;
		}, resolvers);

		// TODO: I need to add types to resolvers
		resolvers['Query'] = Object.entries(this.settings.query).reduce(
			(agg, [key, query]) => {
				const schema = this.dictionary.getSchema(query.schema);
				const single = query.single || false;

				agg[key] = async (
					_: GraphqlGenericType,
					actions: GraphqlGenericType,
				) => {
					// This is the code that runs to process joins
					const properties = {};
					const primary = schema.getPrimaryField();

					// translate from reference to structure
					primary.write(properties, actions[primary.getReference()]);

					const res = await schema.read(this.dictionary, {
						properties,
						actions,
					});

					return single ? res[0] : res;
				};

				return agg;
			},
			{},
		);

		return resolvers;
	}
}
