import {Datum} from './datum';
import {DatumInterface} from './datum.interface';
import {
	EnvironmentDatumFactory,
	EnvironmentInterface,
	EnvironmentSelector,
	EnvironmentSettings,
} from './environment.interface';

export class Environment<
	SelectorT extends EnvironmentSelector,
	DatumT extends DatumInterface,
> implements EnvironmentInterface<SelectorT, DatumT>
{
	references: Map<string, DatumT>;
	factory: EnvironmentDatumFactory<DatumT>;

	constructor(settings: EnvironmentSettings<DatumT>) {
		this.references = new Map();
		this.factory = settings.factory;

		const root = this.factory('root', {
			metadata: {type: 'root'},
			features: {},
		});

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

	select(
		base: DatumT,
		select: EnvironmentSelector,
	): DatumT[] {
		if (select.reference) {
			base = this.references.get(select.reference);
		} else if (base === null) {
			base = this.references.get('_root');
		}

		return <DatumT[]>base.select(select);
	}
}
