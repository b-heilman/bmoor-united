import {
	DatumReference,
	DatumSelector,
	DatumSettings,
	IDatum,
} from './datum.interface';

export type EnvironmentDatumFactory<DatumT, SettingsT> = (
	string: string,
	settings?: SettingsT,
) => DatumT;

export interface EnvironmentSettings<
	DatumT extends IDatum,
	SettingsT extends DatumSettings,
> {
	content: Record<DatumReference, SettingsT>;
	factory: EnvironmentDatumFactory<DatumT, SettingsT>;
}

export interface EnvironmentSelector extends DatumSelector {
	reference?: string;
}

// interface which allows local methods to be defined
export interface EnvironmentInterface<
	DatumT extends IDatum,
	SelectorT extends EnvironmentSelector,
> {
	select(base: DatumT, select: SelectorT): DatumT[];
}
