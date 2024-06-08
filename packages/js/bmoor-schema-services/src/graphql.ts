import {Dictionary, SchemaInterface, TypingJSON} from '@bmoor/schema';

import {GraphqlSettings} from './graphql.interface';

export class Graphql<
	TypingT extends TypingJSON,
	SchemaT extends SchemaInterface,
> {
	settings: GraphqlSettings;
	dictionary: Dictionary<TypingT, SchemaT>;

	constructor(
		dictionary: Dictionary<TypingT, SchemaT>,
		settings: GraphqlSettings,
	) {
		this.settings = settings;
		this.dictionary = dictionary;
	}
}
