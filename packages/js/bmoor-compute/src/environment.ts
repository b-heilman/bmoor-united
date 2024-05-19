import {DatumInterface, DatumSettings} from './datum.interface';
import {
	EnvironmentDatumFactory,
	EnvironmentInterface,
	EnvironmentSelector,
	EnvironmentSettings,
} from './environment.interface';

export class Environment<
DatumT extends DatumInterface,
	SelectorT extends EnvironmentSelector,
	SettingsT extends DatumSettings,
> implements EnvironmentInterface<DatumT, SelectorT>
{
	references: Map<string, DatumT>;
	factory: EnvironmentDatumFactory<DatumT, SettingsT>;

	constructor(settings: EnvironmentSettings<DatumT, SettingsT>) {
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

	addDatum(datum: DatumT) {
		this.references.set(datum.ref, datum);

		for (const childDatum of datum.children.values()) {
			this.addDatum(<DatumT>childDatum);
		}
	}

	select(base: DatumT, select: EnvironmentSelector): DatumT[] {
		if (select.reference) {
			base = this.references.get(select.reference);
		} else if (base === null) {
			base = this.references.get('_root');
		}

		return <DatumT[]>base.select(select);
	}
}
