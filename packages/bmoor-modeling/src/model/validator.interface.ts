import {ModelFieldInterface} from './field.interface';
import {ModelUpdate} from '../datum.interface';

export interface ModelValidatorSettings {
	fields?: ModelFieldInterface[];
}

export class ModelValidatorInvalidation extends Error {}

export interface ModelValidatorInterface<
	ExternalReference,
	ExternalCreate,
	ExternalUpdate
> {
	validateCreate?(datums: ExternalCreate[]): Promise<Error>;
	validateUpdate?(
		content: ModelUpdate<ExternalReference, ExternalUpdate>[]
	): Promise<Error>;
}
