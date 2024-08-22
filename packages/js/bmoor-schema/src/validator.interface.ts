import {ValidationFn, ValidationReference} from './validation.interface';

export interface ValidatorInterface {
	define(types: Record<ValidationReference, ValidationFn>);
	addValidation(type: ValidationReference, info: ValidationFn): void;
	getValidation(type: ValidationReference): ValidationFn;
}
