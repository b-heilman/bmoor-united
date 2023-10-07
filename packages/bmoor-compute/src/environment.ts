import {OrderedMap} from '@bmoor/index';

import {Datum} from './datum';
import {DatumSelector} from './datum.interface';
import {
	EnvironmentInterface,
	EnvironmentSelector,
	EnvironmentSettings,
} from './environment.interface';
import {IntervalInterface} from './interval.interface';

export type Interval = string;
export type Order = number;

export class Environment
	implements
		EnvironmentInterface<
			EnvironmentSelector,
			DatumSelector,
			Interval,
			Order
		>
{
	map: OrderedMap<string, Map<string, Datum>>;

	constructor(settings: EnvironmentSettings) {
		this.map = new OrderedMap();

		for (const intervalRef in settings) {
			const myMap = new Map();
			const sub = settings[intervalRef];

			this.map.set(intervalRef, myMap);

			for (const datumRef in sub) {
				const info = sub[datumRef];
				const datum = new Datum(datumRef, info);

				this.addDatum(myMap, datum);
			}
		}
	}

	addDatum(map, datum: Datum) {
		map.set(datum.ref, datum);

		for (const childDatum of datum.children.values()) {
			this.addDatum(map, childDatum);
		}
	}

	select(
		interval: IntervalInterface<Interval, Order>,
		select: EnvironmentSelector,
	): Datum[] {
		const current = this.map.get(interval.ref);
		const head = current.get(select.reference);

		return head.select(select);
	}

	intervalSelect(
		datum: Datum,
		interval: IntervalInterface<Interval, Order>,
	): Datum {
		return this.map.get(interval.ref).get(datum.ref);
	}

	rangeSelect(
		datum: Datum,
		interval: IntervalInterface<Interval, Order>,
		range: number,
	): Map<IntervalInterface<Interval, Order>, Datum> {
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
}
