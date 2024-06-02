import {DictionaryInterface, DictionaryJSON} from './dictionary.interface';
import {Schema} from './schema';
import {SchemaInterface, SchemaReference} from './schema.interface';

export class Dictionary implements DictionaryInterface {
	schemas: Record<SchemaReference, Schema>;

	constructor(settings: DictionaryJSON) {
		this.schemas = {};

		for (const schemaSettings of settings.schemas) {
			const schema = new Schema(schemaSettings);
			const schemaRef = schema.getReference();

			if (schemaRef) {
				this.schemas[schemaRef] = schema;
			}
		}
	}

	getSchema(ref: SchemaReference): SchemaInterface {
		return this.schemas[ref];
	}

	toJSON(): DictionaryJSON {
		return {
			schemas: Object.values(this.schemas).map((schema) =>
				schema.toJSON(),
			),
		};
	}
}
