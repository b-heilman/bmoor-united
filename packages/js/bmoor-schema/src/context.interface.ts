import {SchemaInterface, SchemaReference} from './schema.interface';
import {TypingJSON, TypingReference} from './typing.interface';
import {ValidatorFn, ValidatorReference} from './validator.interface';

export interface ContextInterface<T extends TypingJSON = TypingJSON> {
	getValidator(ref: ValidatorReference): ValidatorFn;
	getTyping(ref: TypingReference): T;
	getSchema(ref: SchemaReference): SchemaInterface;
}
