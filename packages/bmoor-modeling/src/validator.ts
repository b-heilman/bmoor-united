import {ExternalDatum} from './datum.interface';
import {
	ValidatorInterface,
	ValidatorInvalidation,
	ValidatorSettings
} from './validator.interface';

class Validator implements ValidatorInterface {
	incomingSettings: ValidatorSettings;

	constructor(settings: ValidatorSettings) {
		this.incomingSettings = settings;
	}

	validateCreate(datums: ExternalDatum[]): ValidatorInvalidation {
		return null;
	}

	validateUpdate(datums: ExternalDatum[]): ValidatorInvalidation {
		return null;
	}
}
