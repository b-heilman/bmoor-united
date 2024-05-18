import {
	DatumInterface,
	DatumReference,
	DatumSelector,
	DatumSettings,
} from './datum.interface';

export type EnvironmentDatumFactory<DatumT> = (
	string: string,
	settings: DatumSettings,
) => DatumT;

export interface EnvironmentSettings<
	DatumT extends DatumInterface = DatumInterface,
> {
	content: Record<DatumReference, DatumSettings>;
	factory: EnvironmentDatumFactory<DatumT>;
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
