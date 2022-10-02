import {ModelFieldInterface} from './field.interface';

export interface ValidatorSettings {
	fields?: ModelFieldInterface[];
}

export class ValidatorInvalidation extends Error {}

export interface ValidatorInterface<External> {
	validateCreate(datums: External[]): ValidatorInvalidation;
	validateUpdate(datums: External[]): ValidatorInvalidation;
}
