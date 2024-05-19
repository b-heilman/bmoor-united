import {OrderedMap} from '@bmoor/index';

import {Environment} from '../environment';
import {IntervalInterface} from '../interval.interface';
import {
	IntervalDatumInterface,
	IntervalDatumSettings,
} from './datum.interface';
import {
	IntervalEnvironmentInterface,
	IntervalEnvironmentSelector,
	IntervalEnvironmentSettings,
} from './environment.interface';

type IntervalT = string;
type OrderT = number;

export class IntervalEnvironment<
	DatumT extends IntervalDatumInterface = IntervalDatumInterface,
	SelectorT extends
		IntervalEnvironmentSelector = IntervalEnvironmentSelector,
> implements IntervalEnvironmentInterface<DatumT, SelectorT>
{
	intervals: Map<IntervalT, IntervalInterface<IntervalT, OrderT>>;
	envs: OrderedMap<
		string,
		Environment<DatumT, SelectorT, IntervalDatumSettings>
	>;

	constructor(
		settings: IntervalEnvironmentSettings<DatumT, IntervalDatumSettings>,
	) {
		this.envs = new OrderedMap();
		this.intervals = new Map();

		Object.entries(settings.content).forEach(
			([intervalRef, envSettings], i) => {
				const interval = {ref: intervalRef, order: i};

				const upgraded = Object.entries(envSettings).reduce(
					(agg, [key, settings]) => {
						agg[key] = {
							...settings,
							interval,
						};

						return agg;
					},
					<Record<string, IntervalDatumSettings>>{},
				);

				const environment = new Environment<
					DatumT,
					SelectorT,
					IntervalDatumSettings
				>({
					factory: settings.factory(interval),
					content: upgraded,
				});

				this.intervals.set(interval.ref, interval);
				this.envs.set(interval.ref, environment);
			},
		);
	}

	select(base: DatumT, select: SelectorT): DatumT[] {
		let rtn;

		if (base && 'order' in base && 'ref' in base) {
			rtn = this.envs.get(base.ref).select(null, select);
		} else {
			if (select.interval) {
				rtn = this.envs.get(select.interval.ref).select(base, select);
			} else {
				rtn = base.select(select);
			}
		}

		return rtn;
	}

	range(datum: DatumT, range: number, strict: boolean = false): DatumT[] {
		const interval = datum.interval;
		const offset = interval.ref;
		const rtn = [];
		const begin = this.envs.getTagOffset(offset, 1 - range, true);

		for (const [intervalRef, env] of this.envs
			.getBetween(begin, offset)
			.entries()
		) {
			const res = env.references.get(datum.ref);

			if (!res && strict) {
				throw new Error(
					`not able to range (${datum.ref}, ${datum.interval.ref}, ${intervalRef})`,
				);
			} else {
				rtn.push(res);
			}
		}

		return rtn;
	}

	// offset: positive is backwards, negative is forwards in time
	offset(datum: DatumT, offset: number, strict = false): DatumT {
		const newIntervalRef = this.envs.getTagOffset(
			datum.interval.ref,
			-offset,
		);

		const rtn = this.envs.get(newIntervalRef).references.get(datum.ref);

		if (!rtn && strict) {
			throw new Error(
				`not able to offset (${datum.ref}, ${datum.interval.ref}, ${offset}, ${newIntervalRef})`,
			);
		} else {
			return rtn;
		}
	}

	getInterval(reference: IntervalT): IntervalInterface<IntervalT, OrderT> {
		return this.intervals.get(reference);
	}
}
