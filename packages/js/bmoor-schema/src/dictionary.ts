import {
	ConnectorFn,
	ConnectorInterface,
	ConnectorReference,
} from './connector.interface';
import {DictionaryInterface, DictionaryJSON} from './dictionary.interface';
import {Schema} from './schema';
import {SchemaInterface, SchemaReference} from './schema.interface';
import {types} from './typing';
import {
	TypingInterface,
	TypingJSON,
	TypingReference,
} from './typing.interface';
import {validations} from './validator';
import {
	ValidatorInterface,
	ValidatorReference,
} from './validator.interface';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type GenericInput = any;

export class Dictionary<SchemaT extends SchemaInterface>
	implements DictionaryInterface<SchemaT>
{
	builder: (input: GenericInput) => SchemaT[];
	schemas: Record<SchemaReference, SchemaT>;
	typing: TypingInterface;
	validations: ValidatorInterface;
	connectors: ConnectorInterface;

	constructor(
		builder: (input: GenericInput) => SchemaT[],
		settings: GenericInput = null,
	) {
		this.typing = types;
		this.builder = builder;
		this.validations = validations;

		if (settings) {
			this.define(settings);
		}
		const schemas = builder(settings);
		this.schemas = schemas.reduce((agg, schema) => {
			agg[schema.getReference()] = schema;

			return agg;
		}, {});
	}

	setTyping(typing: TypingInterface) {
		this.typing = typing;
	}

	getTyping(ref: TypingReference): TypingJSON {
		return this.typing.getType(ref);
	}

	setValidators(validations: ValidatorInterface) {
		this.validations = validations;
	}

	getValidator(ref: ValidatorReference) {
		return this.validations.getValidator(ref);
	}

	setConnectors(connectors: ConnectorInterface) {
		this.connectors = connectors;
	}

	getConnector(ref: ConnectorReference): ConnectorFn {
		return this.connectors.getConnection(ref);
	}

	define(input: GenericInput) {
		const schemas = this.builder(input);
		this.schemas = schemas.reduce((agg, schema) => {
			agg[schema.getReference()] = schema;

			return agg;
		}, {});
	}

	addSchema(schema: SchemaT) {
		this.schemas[schema.getReference()] = schema;
	}

	getSchema(ref: SchemaReference): SchemaT {
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

export function dictionaryBuilder(settings: DictionaryJSON) {
	return settings.schemas.map(
		(schemaSettings) => new Schema(schemaSettings),
	);
}
