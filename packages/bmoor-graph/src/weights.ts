import {WeightData} from './weights.interface';

export class Weights {
	data: WeightData;

	constructor(incoming: WeightData = {}) {
		// this assumes the data is deflated and flat
		this.data = incoming;
	}

	hasValue(attr: string) {
		return attr in this.data;
	}

	async getValue(attr: string) {
		return this.get(attr);
	}

	async setValue(attr: string, value: number) {
		this.set(attr, value);

		return true;
	}

	set(mount: string, value: number) {
		this.data[mount] = value;
	}

	has(mount: string) {
		return mount in this.data;
	}

	load(input: WeightData) {
		Object.assign(this.data, input);
	}

	get(mount: string, defaultValue: number = null): number {
		const rtn = mount in this.data ? this.data[mount] : defaultValue;

		return rtn;
	}

	sum(mount: string, value: number) {
		if (mount in this.data) {
			this.data[mount] += value;
		} else {
			this.data[mount] = value;
		}
	}
	/*
    This won't work for a tier+1 aggregate...  If you have 6 children
    (e.g. 1 - 2 - 3 structure), count will be 2, not 6 
    count(mount: string, value: number) {
        if (value){
            if (mount in this.data){
                this.data[mount] += 1;
            } else {
                this.data[mount] = 1
            }
        }
    }
    */
	keys() {
		return Object.keys(this.data);
	}

	toJSON() {
		return Object.keys(this.data).reduce((agg, key) => {
			const value = this.data[key];

			agg[key] = value;

			return agg;
		}, {});
	}
}
