import {Field} from './field';
import {FieldInterface, FieldReference} from './field.interface';
import {
	SchemaInterface,
	SchemaJSON,
	SchemaReference,
} from './schema.interface';

export class Schema implements SchemaInterface {
	settings: SchemaJSON;
	fields: Record<FieldReference, FieldInterface>;

	constructor(schema: SchemaJSON) {
		this.settings = schema; // I'll probably change this later, but for now, is what it is
		this.fields = schema.fields.reduce((agg, fieldSchema, dex) => {
			const field = new Field(fieldSchema);
			const ref = field.getReference() || 'field_' + dex;

			agg[ref] = field;

			return agg;
		}, {});
	}

	getReference(): SchemaReference {
		return this.settings.reference;
	}

	getFields(): FieldInterface[] {
		return Object.values(this.fields);
	}

	getField(ref: FieldReference): FieldInterface {
		return this.fields[ref];
	}

	toJSON(): SchemaJSON {
		return this.settings;
	}
}
