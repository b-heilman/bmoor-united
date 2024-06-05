export type ValidatorReference = string;

// Only returns a string if invalid, otherwise returns null
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ValidatorFn = (value: any) => Promise<string>;

export interface ValidatorJSON {
	validator: ValidatorReference;
}

export interface ValidatorInterface {
	define(types: Record<ValidatorReference, ValidatorFn>);
	addValidator(type: ValidatorReference, info: ValidatorFn): void;
	getValidator(type: ValidatorReference): ValidatorFn;
}
