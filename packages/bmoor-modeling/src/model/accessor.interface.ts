import {ModelFieldSet} from './field/set';

export type InternalKeyReader<InternalRead, InternalReference> = (
	datum: InternalRead | InternalReference
) => string | number;

export type ExternalKeyReader<ExternalRead, ExternalReference> = (
	datum: ExternalRead | ExternalReference
) => string | number;

export interface ModelAccessorSettings {
	fields: ModelFieldSet;
}

export interface ModelAccessorInterface<
	ExternalRead,
	ExternalReference,
	InternalRead,
	InternalReference
> {
	getInternalKey: InternalKeyReader<InternalRead, InternalReference>;
	getExternalKey: ExternalKeyReader<ExternalRead, ExternalReference>;
}
