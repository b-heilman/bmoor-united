import {OrderedMap} from '@bmoor/index';

import {Environment} from '../environment';
import {IntervalInterface} from '../interval.interface';
import {IntervalDatumInterface} from './datum.interface';
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
	DatumT extends IntervalDatumInterface = IntervalDatumInterface,
> implements IntervalEnvironmentInterface<SelectorT, DatumT>
{
	intervals: Map<IntervalT, IntervalInterface<IntervalT, OrderT>>;
	envs: OrderedMap<string, Environment<SelectorT, DatumT>>;

	constructor(settings: IntervalEnvironmentSettings) {
		this.envs = new OrderedMap();
		this.intervals = new Map();

		Object.entries(settings).forEach(([intervalRef, envSettings], i) => {
			const interval = {ref: intervalRef, order: i};

			const environment = new Environment<SelectorT, DatumT>(envSettings);

			this.intervals.set(interval.ref, interval);
			this.envs.set(interval.ref, environment);
		});
	}

	select(base: DatumT, select: SelectorT): DatumT[] {
		let rtn;

		if ('order' in base && 'ref' in base) {
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

	range(datum: DatumT, range: number, strict?: boolean): DatumT[] {
		const interval = datum.interval;
		const offset = interval.ref;
		const rtn = [];
		const begin = this.envs.getTagOffset(offset, 1 - range, true);

		for (const [intervalRef, env] of this.envs
			.getBetween(begin, offset)
			.entries()) {
			rtn.push(env.references.get(intervalRef));
		}

		return rtn;
	}

	offset(datum: DatumT, offset: number, strict = false): DatumT {
		const newIntervalRef = this.envs.getTagOffset(
			datum.interval.ref,
			offset,
		);

		const rtn = this.envs
			.get(newIntervalRef)
			.references.get(datum.interval.ref);

		if (!rtn && strict) {
			throw new Error('not able to offset');
		} else {
			return rtn;
		}
	}

	getInterval(reference: IntervalT): IntervalInterface<IntervalT, OrderT> {
		return this.intervals.get(reference);
	}
}
