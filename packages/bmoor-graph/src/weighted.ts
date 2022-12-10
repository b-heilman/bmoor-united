import {get, set, implode} from '@bmoor/object';

import {Weights} from './weighted.interface';

export class Weighted {
	weights: Weights;

	constructor() {
		this.weights = {};
	}

	addWeights(weights: Weights) {
		Object.assign(this.weights, weights);

		return this;
	}

	setWeight(mount: string, value: number) {
		set(this.weights, mount, value);
	}

	getWeight(mount: string): number {
		return get(this.weights, mount);
	}

	getFeaures(): string[] {
		return Object.keys(implode(this.weights));
	}

	compareWeight(other: Weighted, mount: string): number {
		return this.getWeight(mount) - other.getWeight(mount);
	}

	compareWeights(other: Weighted, mounts: string[]): Weights {
		return mounts.reduce((agg, mount) => {
			agg[mount] = this.compareWeight(other, mount);

			return agg;
		}, {});
	}
}
