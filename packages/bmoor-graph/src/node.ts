import {Weights} from './weights.interface';
import {Edge} from './edge';
import {Event} from './event';

export class Node {
	ref: string;
	byNode: Record<string, Edge[]>;
	byEvent: Record<string, Edge>;
	weights: Record<string, number>;

	constructor(ref: string) {
		this.ref = ref;
		this.byNode = {};
		this.byEvent = {};
		this.weights = {};
	}

	addEdge(edge: Edge) {
		this.byEvent[edge.event.ref] = edge;

		const arr = this.byNode[edge.to.ref];
		if (arr) {
			this.byNode[edge.to.ref].push(edge);
		} else {
			this.byNode[edge.to.ref] = [edge];
		}
	}

	getEdge(check: Event): Edge {
		return this.byEvent[check.ref];
	}

	getEdges(check: Node): Edge[] {
		return this.byNode[check.ref] || [];
	}

	getEdgeCount() {
		return Object.keys(this.byNode).length;
	}

	setWeight(mount: string, value: number) {
		this.weights[mount] = value;
	}

	addWeights(weights: Weights) {
		Object.assign(this.weights, weights);

		return this;
	}

	getWeight(mount: string, value: number = null): number {
		return mount in this.weights ? this.weights[mount] : value;
	}

	toJSON() {
		return {
			ref: this.ref,
			weights: this.weights,
			edges: Object.values(this.byEvent).map((edge) => edge.toJSON())
		};
	}
}
