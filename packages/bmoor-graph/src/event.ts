import {Weights} from './weights.interface';

export class Event {
	ref: string;
	weights: Weights;

	constructor(ref: string) {
		this.ref = ref;
		this.weights = {};
	}

	addWeights(weights: Weights) {
		Object.assign(this.weights, weights);

		return this;
	}

	toJSON() {
		return {
			ref: this.ref,
			weights: this.weights
		};
	}
}
