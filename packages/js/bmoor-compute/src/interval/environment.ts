import {OrderedMap} from '@bmoor/index';

import {DatumReference} from '../datum.interface';
import {Environment} from '../environment';
import {IntervalInterface} from '../interval.interface';
import {IntervalDatum} from './datum';
import {IntervalDatumSettings} from './datum.interface';
import {
	IntervalEnvironmentInterface,
	IntervalEnvironmentSelector,
	IntervalEnvironmentSettings,
} from './environment.interface';

type IntervalT = string;
type OrderT = number;

export class IntervalEnvironment<
	SelectorT extends
		IntervalEnvironmentSelector = IntervalEnvironmentSelector,
> implements IntervalEnvironmentInterface<IntervalDatum, SelectorT>
{
	intervals: Map<IntervalT, IntervalInterface<IntervalT, OrderT>>;
	envs: OrderedMap<string, Environment<SelectorT, IntervalDatumSettings>>;

	constructor(
		settings: IntervalEnvironmentSettings<
			IntervalDatum,
			IntervalDatumSettings
		>,
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

	getDatum(ref: DatumReference, interval: string): IntervalDatum {
		return <IntervalDatum>this.envs.get(interval).getDatum(ref);
	}

	select(base: IntervalDatum, select: SelectorT): IntervalDatum[] {
		let rtn;

		if (base && 'order' in base && 'ref' in base) {
			rtn = this.envs.get(base.getReference()).select(null, select);
		} else {
			if (select.interval) {
				rtn = this.envs.get(select.interval.ref).select(base, select);
			} else {
				rtn = base.select(select);
			}
		}

		return rtn;
	}

	range(
		datum: IntervalDatum,
		range: number,
		strict: boolean = false,
	): IntervalDatum[] {
		const interval = datum.interval;
		const offset = interval.ref;
		const rtn = [];
		const begin = this.envs.getTagOffset(offset, 1 - range, true);

		for (const [intervalRef, env] of this.envs
			.getBetween(begin, offset)
			.entries()) {
			const res = env.references.get(datum.getReference());

			if (!res && strict) {
				throw new Error(
					`not able to range (${datum.getReference()}, ${datum.interval.ref}, ${intervalRef})`,
				);
			} else {
				rtn.push(res);
			}
		}

		return rtn;
	}

	// offset: positive is backwards, negative is forwards in time
	offset(
		datum: IntervalDatum,
		offset: number,
		strict = false,
	): IntervalDatum {
		const newIntervalRef = this.envs.getTagOffset(
			datum.interval.ref,
			-offset,
		);
		// console.log('Env:offset =>', datum.ref, datum.interval.ref, offset, newIntervalRef);

		const rtn = this.envs
			.get(newIntervalRef)
			.references.get(datum.getReference());

		if (!rtn && strict) {
			throw new Error(
				`not able to offset (${datum.getReference()}, ${datum.interval.ref}, ${offset}, ${newIntervalRef})`,
			);
		} else {
			return <IntervalDatum>rtn;
		}
	}

	getInterval(reference: IntervalT): IntervalInterface<IntervalT, OrderT> {
		return this.intervals.get(reference);
	}
}
