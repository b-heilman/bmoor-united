import {DynamicObject} from '@bmoor/object';

import {FieldInterface, FieldNeed} from './field.interface.ts';
import {SchemaInterface} from './schema.interface.ts';
import {TypingInterface, TypingJSON} from './typing.interface.ts';
import type {
	ValidationError,
	ValidationFn,
	ValidationReference,
} from './validation.interface.ts';
import type {ValidatorInterface} from './validator.interface.ts';

export class Validator<
	TypeT extends TypingJSON = TypingJSON,
> implements ValidatorInterface<TypeT> {
	index: Record<ValidationReference, ValidationFn>;

	constructor(
		validations: Record<ValidationReference, ValidationFn> = {},
	) {
		this.index = validations;
	}

	clear() {
		this.index = {};
	}

	define(validations: Record<ValidationReference, ValidationFn>) {
		this.index = {...this.index, ...validations};
	}

	addValidation(type: ValidationReference, info: ValidationFn) {
		this.index[type] = info;
	}

	getValidation(type: ValidationReference): ValidationFn | null {
		if (type in this.index) {
			return this.index[type];
		} else {
			return null;
		}
	}

	async validateField(
		types: TypingInterface<TypeT>,
		obj: DynamicObject,
		field: FieldInterface,
	): Promise<ValidationError> {
		const value = field.read(obj);
		const toTest = types.getType(field.getType()).info.validations;
		const info = field.getInfo();
		const c = toTest.length;

		let rtn = null;

		for (let i = 0; i < c && rtn === null; i++) {
			const isEmpty = value === null || value === undefined;
			if (isEmpty) {
				if (info.need === FieldNeed.required) {
					rtn = 'is required';
				} else if (info.need === FieldNeed.optional && value === null) {
					rtn = 'as optional field is null';
				}
			} else {
				const validation = this.getValidation(toTest[i]);

				if (validation) {
					rtn = await validation(value, info);
				}
			}
		}

		return rtn;
	}

	async validateSchema(
		schema: SchemaInterface<TypeT>,
		obj: DynamicObject,
	): Promise<ValidationError[]> {
		return (
			await Promise.all(
				schema.getFields().map(async (field) => {
					const info = field.getInfo();
					const rtn = this.validateField(
						schema.getTyping(),
						obj,
						field,
					);

					if (!rtn && 'mount' in info){
						const mount = field.read(obj);
						const relationship = schema.getRelationship(info.mount);

						let child;
						if (relationship.type === 'toOne'){
							child = this.validateSchema(relationship.other, mount);
						} else {

						}

						return await Promise.all([rtn]);
					} else {
						return rtn;
					}
				}),
			)
		).flat().filter((error) => error);
	}
}

/*
	Types can be defined and assumed validations registered.  Validations can then be added, removed, 
	or edited here to effect how types are validated.

	I used to assume there would be a generic central schema, but going forward I am going to allow 
	synthetic schemas, like User -> UserUpdate where the requirements can be more finetuned.
	The synthetic schemas point back to the primary schema.  If User schema is different from what 
	would be sent on create, you can set up a synthetic User -> UserCreate.  This allows me to remove
	mode from being passed around
*/
export const validator = new Validator({
	string: async (input) =>
		typeof input === 'string' ? null : 'is not a string',
	number: async (input) =>
		typeof input === 'number' ? null : 'is not a number',
	int: async (input) =>
		Number.isInteger(input) ? null : 'is not integer',
	float: async (input) => (!Number.isInteger(input) ? null : 'is integer'),
});
