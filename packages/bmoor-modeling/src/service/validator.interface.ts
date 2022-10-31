import {ModelFieldInterface} from '../model/field.interface';
import {UpdateDelta} from '../datum.interface';

export interface ServiceValidatorSettings {
	fields?: ModelFieldInterface[];
}

export class ServiceValidatorInvalidation extends Error {}

export interface ServiceValidatorInterface<
	ExternalReference,
	ExternalCreate,
	ExternalUpdate
> {
	validateCreate?(datums: ExternalCreate[]): Promise<Error>;
	validateUpdate?(
		content: UpdateDelta<ExternalReference, ExternalUpdate>[]
	): Promise<Error>;
}
