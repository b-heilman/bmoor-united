import {equals} from '@bmoor/object';

import {FeatureValues} from './features.interface';

export class Features {
	data: FeatureValues;

	constructor(incoming: FeatureValues = null) {
		if (!incoming) {
			incoming = {};
		}

		// this assumes the data is deflated and flat
		this.data = incoming;
	}

	set(mount: string, value: number) {
		this.data[mount] = value;
	}

	has(mount: string) {
		return mount in this.data;
	}

	load(input: FeatureValues) {
		Object.assign(this.data, input);
	}

	get(mount: string, defaultValue: number = null): number {
		const rtn = mount in this.data ? this.data[mount] : defaultValue;

		return rtn;
	}

	hasValue(attr: string) {
		return this.has(attr);
	}

	async getValue(attr: string) {
		return this.get(attr);
	}

	async setValue(attr: string, value: number) {
		this.set(attr, value);

		return true;
	}

	keys(): string[] {
		return Object.keys(this.data);
	}

	hasData(): boolean {
		return Object.keys(this.data).length > 0;
	}

	merge(other: Features) {
		this.load(other.data);
	}

	equals(other: Features) {
		return equals(this.data, other.data);
	}

	sum(mount: string, value: number) {
		if (mount in this.data) {
			this.data[mount] += value;
		} else {
			this.data[mount] = value;
		}
	}

	toJSON() {
		return Object.keys(this.data).reduce((agg, key) => {
			const value = this.data[key];

			agg[key] = value;

			return agg;
		}, {});
	}
}
