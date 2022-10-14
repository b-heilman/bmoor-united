import {
	ModelValidatorInterface,
	ModelValidatorInvalidation,
	ModelValidatorSettings
} from './validator.interface';

import {ModelUpdate} from '../datum.interface';

export class ModelValidator<
	ExternalReference,
	ExternalCreate,
	ExternalUpdate
> implements
		ModelValidatorInterface<
			ExternalReference,
			ExternalCreate,
			ExternalUpdate
		>
{
	incomingSettings: ModelValidatorSettings;

	constructor(settings: ModelValidatorSettings) {
		this.incomingSettings = settings;
	}

	validateCreate(
		datums: ExternalCreate[]
	): Promise<ModelValidatorInvalidation> {
		return null;
	}

	validateUpdate(
		content: ModelUpdate<ExternalReference, ExternalUpdate>[]
	): Promise<ModelValidatorInvalidation> {
		return null;
	}
}
