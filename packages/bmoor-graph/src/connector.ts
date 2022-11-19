import {Weights} from './weights.interface';
import {Edge} from './edge';

export class Connector {
	info: Record<string, Edge>;

	constructor(info: Record<string, Edge>) {
		this.info = info;
	}

	addEdgeWeight(ref: string, weights: Weights) {
		this.info[ref].addWeights(weights);

		return this;
	}

	addEventWeight(weights: Weights) {
		this.info[Object.keys(this.info)[0]].event.addWeights(weights);

		return this;
	}
}
