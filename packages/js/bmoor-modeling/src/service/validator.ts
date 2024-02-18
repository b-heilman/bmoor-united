import {UpdateDelta} from '../datum.interface';
import {
	ServiceValidatorInterface,
	ServiceValidatorInvalidation,
	ServiceValidatorSettings,
} from './validator.interface';

export class ServiceValidator<
	ExternalReference,
	ExternalCreate,
	ExternalUpdate,
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
		datums: ExternalCreate[],
	): Promise<ServiceValidatorInvalidation> {
		console.log(datums);
		return null;
	}

	validateUpdate(
		content: UpdateDelta<ExternalReference, ExternalUpdate>[],
	): Promise<ServiceValidatorInvalidation> {
		console.log(content);
		return null;
	}
}
