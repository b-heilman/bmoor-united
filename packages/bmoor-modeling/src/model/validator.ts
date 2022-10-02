import {
	ValidatorInterface,
	ValidatorInvalidation,
	ValidatorSettings
} from './validator.interface';

export class ModelValidator<External>
	implements ValidatorInterface<External>
{
	incomingSettings: ValidatorSettings;

	constructor(settings: ValidatorSettings) {
		this.incomingSettings = settings;
	}

	validateCreate(/*datums: External[]*/): ValidatorInvalidation {
		return null;
	}

	validateUpdate(/*datums: External[]*/): ValidatorInvalidation {
		return null;
	}
}
