import {
	ServiceValidatorInterface,
	ServiceValidatorInvalidation,
	ServiceValidatorSettings
} from './validator.interface';

import {UpdateDelta} from '../datum.interface';

export class ServiceValidator<
	ExternalReference,
	ExternalCreate,
	ExternalUpdate
> implements
		ServiceValidatorInterface<
			ExternalReference,
			ExternalCreate,
			ExternalUpdate
		>
{
	incomingSettings: ServiceValidatorSettings;

	constructor(settings: ServiceValidatorSettings) {
		this.incomingSettings = settings;
	}

	validateCreate(
		datums: ExternalCreate[]
	): Promise<ServiceValidatorInvalidation> {
		return null;
	}

	validateUpdate(
		content: UpdateDelta<ExternalReference, ExternalUpdate>[]
	): Promise<ServiceValidatorInvalidation> {
		return null;
	}
}
