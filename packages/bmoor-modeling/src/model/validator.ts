import {
	ModelValidatorInterface,
	ModelValidatorInvalidation,
	ModelValidatorSettings
} from './validator.interface';

import {DeltaKeyReader} from './properties.interface';

export class ModelValidator<External, Delta>
	implements ModelValidatorInterface<External, Delta>
{
	incomingSettings: ModelValidatorSettings;

	constructor(settings: ModelValidatorSettings) {
		this.incomingSettings = settings;
	}

	validateCreate(datums: External[]): ModelValidatorInvalidation {
		console.log(datums);
		return null;
	}

	validateUpdate(
		datums: Delta[],
		fn: DeltaKeyReader<Delta>
	): ModelValidatorInvalidation {
		console.log(datums.map(fn));
		return null;
	}
}
