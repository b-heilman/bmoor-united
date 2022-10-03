import {ModelFieldInterface} from './field.interface';

import {DeltaKeyReader} from './accessor.interface';

export interface ModelValidatorSettings {
	fields?: ModelFieldInterface[];
}

export class ModelValidatorInvalidation extends Error {}

export interface ModelValidatorInterface<External, Delta> {
	validateCreate(datums: External[]): ModelValidatorInvalidation;
	validateUpdate(
		datums: Delta[],
		fn: DeltaKeyReader<Delta>
	): ModelValidatorInvalidation;
}
