import {
	DictionaryInterface,
	SchemaReference,
	TypingReference,
} from '@bmoor/schema';

export type GraphqlQueryReference = string;

export type GraphqlQueryParams = Record<string, TypingReference>;

export interface GraphqlQuery {
	schema: SchemaReference;
	hook: (
		dict: DictionaryInterface,
		params: Record<string, any>, // eslint-disable-line  @typescript-eslint/no-explicit-any
	) => any[]; // eslint-disable-line  @typescript-eslint/no-explicit-any
	params: GraphqlQueryParams;
	// TODO: security
	// TODO: relationships to follow
}

export type GraphqlJSON = Record<GraphqlQueryReference, GraphqlQuery>;
