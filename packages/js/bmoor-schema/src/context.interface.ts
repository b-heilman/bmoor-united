import {SchemaInterface, SchemaReference} from './schema.interface';
import {TypingJSON, TypingReference} from './typing.interface';
import {ValidationFn, ValidationReference} from './validation.interface';

export interface FormatInterface {
	formatName(ref: string, usage: string): string;
}

export interface ContextInterface<T extends TypingJSON = TypingJSON>
	extends FormatInterface {
	getValidation(ref: ValidationReference): ValidationFn;
	getTyping(ref: TypingReference): T;
	getSchema(ref: SchemaReference): SchemaInterface;
}
