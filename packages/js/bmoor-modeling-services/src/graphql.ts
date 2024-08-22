import {
	BuilderGraphql,
	ContextInterface,
	ModelInterface,
	NexusInterface,
	ServiceInterface,
	TypingJSON,
	dictToGraphql,
} from '@bmoor/modeling';

import {
	GraphqlGenericType,
	GraphqlJSON,
	GraphqlSchemaResolvers,
	GraphqlSchemaSynthetics,
} from './graphql.interface';

function createSchemaResolver(
	nexus: NexusInterface,
	service: ServiceInterface,
): GraphqlSchemaSynthetics {
	const model = service.getModel();

	return model.getRelationships().reduce(
		(agg, relationship) => {
			const other = nexus.getService(relationship.other);
			const otherModel = other.getModel();

			// TODO: I need to test this, I don't think it's right way to plug in, need to test
			//   with a '.' in the path.
			agg[model.getField(relationship.reference).getPath()] = async (
				src: GraphqlGenericType,
				actions: GraphqlGenericType,
			) => {
				// This is the code that runs to process joins
				const params = relationship.otherFields.reduce(
					(mappedArgs, targetRef, i) => {
						const srcField = model.getField(relationship.fields[i]);
						const targetField = otherModel.getField(targetRef);

						targetField.write(mappedArgs, srcField.read(src));

						return mappedArgs;
					},
					{},
				);

				// TODO: need to generate a security context here based on
				//   what is passed
				const callCtx = {
					hasPermission() {
						return true;
					},
					async hasClaim() {
						return true;
					},
					hasFlag() {
						return false;
					},
					getFlag() {
						return null;
					},
					getVariable() {
						return null;
					},
				};

				const res = await other.externalSelect(callCtx, {
					params,
					actions,
				});

				return relationship.type === 'toMany' ? res : res[0];
			};

			return agg;
		},
		<GraphqlSchemaSynthetics>{},
	);
}

export class Graphql<
	TypingT extends TypingJSON,
	ModelT extends ModelInterface,
> {
	nexus: NexusInterface<ModelT>;
	settings: GraphqlJSON;
	serverCtx: ContextInterface<TypingT>;

	constructor(
		ctx: ContextInterface<TypingT>,
		nexus: NexusInterface<ModelT>,
		settings: GraphqlJSON,
	) {
		this.nexus = nexus;
		this.settings = settings;
		this.serverCtx = ctx;
	}

	toString(): string {
		const types = Object.values(this.nexus.getSchemas())
			.map((schema) => {
				const builder = new BuilderGraphql<TypingT>(
					this.serverCtx,
					this.nexus,
				);

				builder.addSchema(schema);

				return builder.toString();
			})
			.join('\n');

		const queries = Object.entries(this.settings.query).reduce(
			(agg, [key, query]) => {
				const service = this.nexus.getService(query.schema);

				const type = this.serverCtx.formatName(
					service.getModel().getReference(),
					'graphql',
				);
				const single = query.single || false;

				const primaries = service.getModel().getPrimaryFields();

				const params = primaries
					.map((field) => {
						const primaryType = this.serverCtx.getTyping(
							field.getInfo().type,
						).graphql;

						return `${field.getReference()}: ${primaryType}!`;
					})
					.concat(
						Object.entries(service.getQueryActions() || {}).map(
							([action, type]) => {
								return `${action}: ${this.serverCtx.getTyping(type).graphql}`;
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

		return `${custom}${types}\n${dictToGraphql(this.serverCtx, queries, 'Query')}`;
	}

	toResolvers(): GraphqlSchemaResolvers {
		const resolvers: GraphqlSchemaResolvers = {};

		// Add the collection resolvers
		Object.values(this.nexus.getSchemas()).reduce((agg, schema) => {
			const resolvers = createSchemaResolver(
				this.nexus,
				this.nexus.getService(schema.getReference()),
			);

			if (Object.keys(resolvers).length > 0) {
				agg[this.serverCtx.formatName(schema.getReference(), 'graphql')] =
					resolvers;
			}

			return agg;
		}, resolvers);

		// TODO: I need to add types to resolvers
		resolvers['Query'] = Object.entries(this.settings.query).reduce(
			(agg, [key, query]) => {
				const service = this.nexus.getService(query.schema);
				const model = service.getModel();
				const single = query.single || false;

				agg[key] = async (
					_: GraphqlGenericType,
					actions: GraphqlGenericType,
				) => {
					// This is the code that runs to process joins
					const params = {};
					const primaries = model.getPrimaryFields();

					// translate from reference to structure
					for (const field of primaries) {
						field.write(params, actions[field.getReference()]);
					}

					// TODO: need to generate a security context here based on
					//   what is passed
					const callCtx = {
						hasPermission() {
							return true;
						},
						async hasClaim() {
							return true;
						},
						hasFlag() {
							return false;
						},
						getFlag() {
							return null;
						},
						getVariable() {
							return null;
						},
					};

					const res = await service.externalSelect(callCtx, {
						params,
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
