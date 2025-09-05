import {TypingJSON, TypingReference} from '../typing.interface.ts';
import {
	ValidationFn,
	ValidationReference,
} from '../validation.interface.ts';

export interface SchemaFormatInterface {
	formatName(ref: string, usage: string): string;
}

export interface SchemaContextInterface<T extends TypingJSON = TypingJSON>
	extends SchemaFormatInterface {
	getValidation(ref: ValidationReference): ValidationFn;
	getTyping(ref: TypingReference): T;
}
