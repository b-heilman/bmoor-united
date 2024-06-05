import {ConnectorFn, ConnectorReference} from './connector.interface';
import {SchemaInterface, SchemaReference} from './schema.interface';
import {TypingJSON, TypingReference} from './typing.interface';
import {ValidatorFn, ValidatorReference} from './validator.interface';

export interface ContextInterface {
	getValidator(ref: ValidatorReference): ValidatorFn;
	getTyping(ref: TypingReference): TypingJSON;
	getSchema(ref: SchemaReference): SchemaInterface;
	getConnector(ref: ConnectorReference): ConnectorFn;
}
