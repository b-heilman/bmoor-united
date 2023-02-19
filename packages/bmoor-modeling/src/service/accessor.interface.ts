import {ModelFieldSet} from '../model/field/set';

export type InternalKeyReader<InternalRead, InternalReference> = (
	datum: InternalRead | InternalReference,
) => string | number;

export type ExternalKeyReader<ExternalRead, ExternalReference> = (
	datum: ExternalRead | ExternalReference,
) => string | number;

export interface ServiceAccessorSettings {
	fields: ModelFieldSet;
}

export interface ServiceAccessorInterface<
	ExternalRead,
	ExternalReference,
	InternalRead,
	InternalReference,
> {
	getInternalKey: InternalKeyReader<InternalRead, InternalReference>;
	getExternalKey: ExternalKeyReader<ExternalRead, ExternalReference>;
}
