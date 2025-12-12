import {FieldInterface} from './field.interface.ts';
import {TypingInterface, TypingJSON} from './typing.interface.ts';
import type {
	ValidationError,
	ValidationFn,
	ValidationReference,
} from './validation.interface.ts';

export interface ValidatorInterface<T extends TypingJSON = TypingJSON> {
	define(types: Record<ValidationReference, ValidationFn>);
	addValidation(type: ValidationReference, info: ValidationFn): void;
	getValidation(type: ValidationReference): ValidationFn | null;

	validateField(
		types: TypingInterface<T>,
		// eslint-disable-next-line  @typescript-eslint/no-explicit-any
		value: any,
		info: FieldInterface,
	): Promise<ValidationError>;
}
