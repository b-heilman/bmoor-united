import {ModelFieldSet} from './field/set';

export type InternalKeyReader<Internal> = (
	datum: Internal
) => string | number;
export type DeltaKeyReader<Delta> = (datum: Delta) => string | number;
export type ExternalKeyReader<External> = (
	datum: External
) => string | number;

export interface ModelAccessorSettings {
	fields: ModelFieldSet;
}

export interface ModelAccessorInterface<External, Delta, Internal> {
	getInternalKey: InternalKeyReader<Internal>;
	getExternalKey: ExternalKeyReader<External>;
	getDeltaKey: DeltaKeyReader<Delta>;
}
