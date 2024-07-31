import {ContextSecurityInterface} from '@bmoor/context';
import {ModelInterface} from '@bmoor/modeling';
import {SchemaReference, TypingReference} from '@bmoor/schema';

export type GraphqlGenericType = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export type GraphqlResolver<
	ResponseT extends GraphqlGenericType = GraphqlGenericType,
	ArgsT extends GraphqlGenericType = GraphqlGenericType,
	ParentT extends GraphqlGenericType = GraphqlGenericType,
> = (parent: ParentT, args: ArgsT) => Promise<ResponseT[] | ResponseT>; // args map to actions, but I don't want to name that here

// TODO: I might want to add schema access patterns?  If I do, this would change.  Right now it's just
//   essentially mapping of the synthetics
export type GraphqlSchemaSynthetics = Record<string, GraphqlResolver>;

export type GraphqlSchemaResolvers = Record<
	SchemaReference,
	GraphqlSchemaSynthetics
>;

export type GraphqlQueryReference = string;

export type GraphqlQueryParams = Record<string, TypingReference>;

export interface GraphqlQuery {
	schema: SchemaReference;
	hook?: {
		fn: (
			ctx: ContextSecurityInterface,
			params: Record<string, any>, // eslint-disable-line  @typescript-eslint/no-explicit-any
		) => any[]; // eslint-disable-line  @typescript-eslint/no-explicit-any
		params?: GraphqlQueryParams;
	};
	single?: boolean;
	// TODO: security
	// TODO: relationships to follow
}

export interface GraphqlJSON {
	query: Record<GraphqlQueryReference, GraphqlQuery>;
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	customTypes?: Record<string, any>;
}
