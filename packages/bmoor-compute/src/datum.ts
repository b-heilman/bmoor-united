import {DatumInterface} from './datum.interface';

export class Datum<Interval> implements DatumInterface<Interval> {
	ref: string;
	data: Map<string, number>;
	interval: Interval;

	constructor(
		ref: string,
		interval: Interval,
		src: Record<string, number>,
	) {
		this.ref = ref;
		this.data = new Map();
		this.interval = interval;

		for (const key in src) {
			this.data.set(key, src[key]);
		}
	}

	hasValue(attr: string) {
		return this.data.has(attr);
	}

	async getValue(attr: string) {
		return this.data.get(attr);
	}

	async setValue(attr: string, value: number) {
		this.data.set(attr, value);

		return true;
	}
}
