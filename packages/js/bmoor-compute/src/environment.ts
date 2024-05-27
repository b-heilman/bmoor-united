import { Datum } from './datum';
import {DatumSettings, DatumInterface} from './datum.interface';
import {
	EnvironmentDatumFactory,
	EnvironmentInterface,
	EnvironmentSelector,
	EnvironmentSettings,
} from './environment.interface';

// This is more abstract, only here for testing
export class Environment<
	SelectorT extends EnvironmentSelector,
	SettingsT extends DatumSettings,
> implements EnvironmentInterface<Datum, SelectorT>
{
	references: Map<string, Datum>;
	factory: EnvironmentDatumFactory<Datum, SettingsT>;

	constructor(settings: EnvironmentSettings<Datum, SettingsT>) {
		this.references = new Map();
		this.factory = settings.factory;

		const root = this.factory('_root');

		this.references.set('_root', root);

		Object.entries(settings.content).forEach(([ref, datumSettings]) => {
			const datum = this.factory(ref, datumSettings);

			root.addChild(datum);

			this.addDatum(datum);
		});
	}

	addDatum(datum: Datum) {
		this.references.set(datum.ref, datum);

		for (const childDatum of datum.children.values()) {
			this.addDatum(<Datum>childDatum);
		}
	}

	select(base: Datum, select: EnvironmentSelector): Datum[] {
		if (select.reference) {
			base = this.references.get(select.reference);
		} else if (base === null) {
			base = this.references.get('_root');
		}

		return <Datum[]>base.select(select);
	}
}
