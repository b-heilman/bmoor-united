import type {
	ValidationFn,
	ValidationReference,
} from './validation.interface.ts';
import type {ValidatorInterface} from './validator.interface.ts';

export class Validator implements ValidatorInterface {
	index: Record<ValidationReference, ValidationFn>;

	constructor(types: Record<ValidationReference, ValidationFn> = {}) {
		this.index = types;
	}

	clear() {
		this.index = {};
	}

	define(types: Record<ValidationReference, ValidationFn>) {
		this.index = {...this.index, ...types};
	}

	addValidation(type: ValidationReference, info: ValidationFn) {
		this.index[type] = info;
	}

	getValidation(type: ValidationReference): ValidationFn {
		return this.index[type];
	}
}

export const validations = new Validator({
	string: async (input, info, mode) => {
		if (!input && info.required) {
			if (input === null) {
				return 'can not be null';
			} else if (mode === 'update' && input === undefined) {
				return null;
			} else {
				return 'is required';
			}
		}

		return typeof input === 'string' ? null : 'not a string';
	},
	number: async (input) =>
		typeof input === 'number' ? null : 'not a number',
});
