import {OrderedMap} from '@bmoor/index';

import {Datum} from './datum';
import {EnvironmentInterface} from './environment.interface';
import {IntervalInterface} from './interval.interface';
import {Selection} from './selection';

export type Interval = string;
export type Order = number;

export interface Selector {
	ref?: string;
	sub?: string;
}

export class Environment
	implements EnvironmentInterface<Selector, Selector, Interval, Order>
{
	map: OrderedMap<string, Map<string, Datum<Selector>>>;

	constructor(
		src: Record<string, Record<string, Record<string, number>>>,
	) {
		this.map = new OrderedMap();

		for (const key in src) {
			const myMap = new Map();
			const sub = src[key];

			this.map.set(key, myMap);

			for (const subkey in sub) {
				myMap.set(subkey, new Datum(subkey, sub[subkey]));
			}
		}
	}

	select(
		interval: IntervalInterface<Interval, Order>,
		select: Selector,
	): Selection<Selector, Interval, Order> {
		return new Selection(interval, [
			this.map.get(interval.ref).get(select.sub),
		]);
	}

	getGlobal(): Datum<Selector> {
		return null;
	}

	intervalSelect(
		datum: Datum<Selector>,
		interval: IntervalInterface<Interval, Order>,
	): Datum<Selector> {
		return this.map.get(interval.ref).get(datum.ref);
	}

	rangeSelect(
		datum: Datum<Selector>,
		interval: IntervalInterface<Interval, Order>,
		range: number,
	): Map<IntervalInterface<Interval, Order>, Datum<Selector>> {
		const offset = interval.ref;

		const rtn = new Map();
		if (range) {
			const begin = this.map.getTagOffset(offset, 1 - range, true);

			for (const [intervalRef, intervalMap] of this.map
				.getBetween(begin, offset)
				.entries()) {
				rtn.set({ref: intervalRef, order: 0}, intervalMap.get(datum.ref));
			}
		} else {
			rtn.set(interval, this.map.get(offset).get(datum.ref));
		}

		return rtn;
	}

	offsetInterval(
		interval: IntervalInterface<Interval, Order>,
		offset: number,
	): IntervalInterface<Interval, Order> {
		return {
			ref: this.map.getTagOffset(interval.ref, offset),
			order: 0,
		};
	}

	overrideSelector(select: Selector, override: Selector = null): Selector {
		if (override?.sub) {
			select.sub = override.sub;
		}

		return select;
	}
}
