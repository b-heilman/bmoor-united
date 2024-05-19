import {
	DatumInterface,
	DatumReference,
	DatumSelector,
	DatumSettings,
} from './datum.interface';

export type EnvironmentDatumFactory<DatumT, SettingsT> = (
	string: string,
	settings?: SettingsT,
) => DatumT;

export interface EnvironmentSettings<
	DatumT extends DatumInterface,
	SettingsT extends DatumSettings
> {
	content: Record<DatumReference, SettingsT>;
	factory: EnvironmentDatumFactory<DatumT, SettingsT>;
}

export interface EnvironmentSelector extends DatumSelector {
	reference: string;
}

// interface which allows local methods to be defined
export interface EnvironmentInterface<
	SelectorT extends EnvironmentSelector,
	DatumT extends DatumInterface,
> {
	select(base: DatumT, select: SelectorT): DatumT[];
}
