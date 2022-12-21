import {get, set, keys} from '@bmoor/object';

import { Weights } from './weights';
import {IntervaledWeights, WeightedInterface} from './weighted.interface';
import { Interval } from './interval.interface';

export class Weighted implements WeightedInterface {
	intervals: IntervaledWeights;

	constructor() {
		this.intervals = new Map();
	}

	getWeights(interval: Interval): Weights{
		let weights = this.intervals.get(interval);

		if (!weights){
			weights = new Weights();

			this.intervals.set(interval, weights);
		}

		return weights;
	}
	/* TODO: do I really want this anymore?
	addWeights(interval: Interval, weights: Weights) {
		Object.assign(this.intervals, weights);

		return this;
	}
	*/
	setWeight(interval: Interval, mount: string, value: number) {
		this.getWeights(interval).set(mount, value);

		return this;
	}

	getWeight(interval: Interval, mount: string): number {
		const weights = this.intervals.get(interval);

		if (weights){
			return weights.get(mount);
		}

		return null;
	}

	getFeaures(): string[] {
		return Array.from(
			new Set(
				Array.from(this.intervals).flatMap(([interval, weights]) => weights.keys())
			)
		);
	}
}
