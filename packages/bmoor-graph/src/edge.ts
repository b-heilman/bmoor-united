import {NodeInterface} from './node.interface';
import {Weights} from './weights.interface';
import {Event} from './event';

export class Edge {
	to: NodeInterface;
	from: NodeInterface;
	event: Event;
	weights: Weights;

	constructor(from: NodeInterface, to: NodeInterface, event: Event) {
		this.to = to;
		this.from = from;
		this.event = event;
		this.weights = {};
	}

	addWeights(weights: Weights) {
		Object.assign(this.weights, weights);

		return this;
	}

	setWeight(mount: string, value: number) {
		this.weights[mount] = value;
	}

	getWeight(mount: string): number {
		return this.weights[mount];
	}

	compareWeight(other: Edge, mount: string): number {
		return this.getWeight(mount) - other.getWeight(mount);
	}

	compareWeights(other, mounts: string[]): Weights {
		return mounts.reduce((agg, mount) => {
			agg[mount] = this.compareWeight(other, mount);

			return agg;
		}, {});
	}

	toJSON() {
		return {
			to: this.to.ref,
			event: this.event.ref,
			weights: this.weights
		};
	}
}
