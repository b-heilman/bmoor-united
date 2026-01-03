import {EnvironmentInterface} from './environment.interface.ts';
import {FieldInterface} from './field.interface.ts';
import type {
	ValidationError,
	ValidationFn,
	ValidationReference,
} from './validation.interface.ts';

export interface ValidatorInterface {
	setEnvironment(know: EnvironmentInterface);

	define(types: Record<ValidationReference, ValidationFn>);
	addValidation(type: ValidationReference, info: ValidationFn): void;
	getValidation(type: ValidationReference): ValidationFn | null;

	validateField(
		// eslint-disable-next-line  @typescript-eslint/no-explicit-any
		value: any,
		info: FieldInterface,
	): Promise<ValidationError>;
}
