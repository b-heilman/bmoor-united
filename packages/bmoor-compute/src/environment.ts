import {OrderedMap} from '@bmoor/index';

import {Datum} from './datum';
import {EnvironmentInterface} from './environment.interface';

export type Interval = string;

export interface Selector {
	ref?: string;
	sub?: string;
}

export class Environment
	implements EnvironmentInterface<Interval, Selector>
{
	map: OrderedMap<string, Map<string, Datum<Interval>>>;

	constructor(
		src: Record<string, Record<string, Record<string, number>>>,
	) {
		this.map = new OrderedMap();

		for (const key in src) {
			const myMap = new Map();
			const sub = src[key];

			this.map.setNode(key, myMap);

			for (const subkey in sub) {
				myMap.set(subkey, new Datum<Interval>(subkey, key, sub[subkey]));
			}
		}
	}

	select(interval: Interval, select: Selector): Datum<Interval>[] {
		return [this.map.getNode(interval).get(select.sub)];
	}

	subSelect(
		datum: Datum<Interval>,
		interval: Interval,
		select: Selector,
	): Datum<Interval>[] {
		return [this.map.getNode(interval).get(select.sub)];
	}

	getGlobal(): Datum<Interval> {
		return null;
	}

	getSelfSelector(datum: Datum<Interval>) {
		return {
			sub: datum.ref,
		};
	}

	intervalSelect(
		datum: Datum<Interval>,
		interval: Interval,
	): Datum<Interval> {
		const select = this.getSelfSelector(datum);

		return this.map.getNode(interval).get(select.sub);
	}

	rangeSelect(
		datum: Datum<Interval>,
		interval: Interval,
		range: number,
	): Datum<Interval>[] {
		const offset = interval;
		const select = this.getSelfSelector(datum);

		let maps = [];
		if (range) {
			const begin = this.map.getTagOffset(offset, 1 - range, true);

			maps = Array.from(this.map.getNodesBetween(begin, offset).values());
		} else {
			maps = [this.map.getNode(offset)];
		}

		return maps.map((map) => map.get(select.sub));
	}

	offsetInterval(interval: Interval, offset: number): Interval {
		return this.map.getTagOffset(interval, offset);
	}

	overrideSelector(select: Selector, override: Selector = null): Selector {
		if (override?.sub) {
			select.sub = override.sub;
		}

		return select;
	}
}
