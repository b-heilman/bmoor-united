import {
	ValidatorFn,
	ValidatorInterface,
	ValidatorReference,
} from './validator.interface';

export class Validator implements ValidatorInterface {
	index: Record<ValidatorReference, ValidatorFn>;

	constructor(types: Record<ValidatorReference, ValidatorFn> = {}) {
		this.index = types;
	}

	clear() {
		this.index = {};
	}

	define(types: Record<ValidatorReference, ValidatorFn>) {
		this.index = {...this.index, ...types};
	}

	addValidator(type: ValidatorReference, info: ValidatorFn) {
		this.index[type] = info;
	}

	getValidator(type: ValidatorReference): ValidatorFn {
		return this.index[type];
	}
}

export const validations = new Validator({
	string: async (input) =>
		typeof input === 'string' ? null : 'not a string',
	number: async (input) =>
		typeof input === 'number' ? null : 'not a number',
});
