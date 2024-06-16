import {create} from '@bmoor/error';
import {DynamicObject} from '@bmoor/object';
import {toCamelCase} from '@bmoor/string';

import {ConnectionFn, ConnectionReference} from './connection.interface';
import {ConnectorInterface} from './connector.interface';
import {DictionaryInterface, DictionaryJSON} from './dictionary.interface';
import {SchemaInterface, SchemaReference} from './schema.interface';
import {
	TypingInterface,
	TypingJSON,
	TypingReference,
} from './typing.interface';
import {ValidationReference} from './validation.interface';
import {ValidatorInterface} from './validator.interface';

export class Dictionary<
	TypingT extends TypingJSON,
	SchemaT extends SchemaInterface,
> implements DictionaryInterface<TypingT, SchemaT>
{
	typing: TypingInterface<TypingT>;
	schemas: Record<SchemaReference, SchemaT>;
	connector: ConnectorInterface;
	validator: ValidatorInterface;

	constructor(
		types: TypingInterface<TypingT>,
		validator: ValidatorInterface,
	) {
		this.typing = types;
		this.validator = validator;
		this.schemas = {};
	}

	setTyping(typing: TypingInterface<TypingT>) {
		this.typing = typing;
	}

	getTyping(ref: TypingReference): TypingT {
		return this.typing.getType(ref);
	}

	setValidator(validator: ValidatorInterface) {
		this.validator = validator;
	}

	getValidation(ref: ValidationReference) {
		return this.validator.getValidation(ref);
	}

	setConnector(connector: ConnectorInterface) {
		this.connector = connector;
	}

	getConnection(ref: ConnectionReference): ConnectionFn {
		return this.connector.getConnection(ref);
	}

	addSchema(schema: SchemaT) {
		const ref = schema.getReference();

		if (!ref) {
			throw create('Schemas in dictionary must have reference', {
				code: 'BMS_DICTIONARY_UNNAMED_SCHEMA',
			});
		}

		schema.setContext(this);

		this.schemas[ref] = schema;
	}

	getSchema(ref: SchemaReference): SchemaT {
		return this.schemas[ref];
	}

	getSchemas(): SchemaT[] {
		return Object.values(this.schemas);
	}

	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	async read(ref: SchemaReference, select: any): Promise<any[]> {
		return this.getSchema(ref).read(this, select);
	}

	async validate(
		ref: SchemaReference,
		root: DynamicObject,
		mode: 'create' | 'update' = 'create',
	): Promise<string[]> {
		return this.getSchema(ref).validate(root, mode);
	}

	formatName(ref: string): string {
		return toCamelCase(ref);
	}

	toJSON(): DictionaryJSON {
		return {
			schemas: Object.values(this.schemas).map((schema) =>
				schema.toJSON(),
			),
		};
	}
}
