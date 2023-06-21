import {EdgeInterface, EdgeJson, EdgeReference} from './edge.interface';
import {NodeInterface, NodeReference} from './node.interface';
import {Weights} from './weights';

export class Edge implements EdgeInterface {
	ref: EdgeReference;
	weights: Weights;
	nodes: NodeInterface[];
	nodeWeights: Map<NodeReference, Weights>;

	constructor(ref: EdgeReference, weights: Weights) {
		this.ref = ref;
		this.weights = weights;
		this.nodes = [];
		this.nodeWeights = new Map();
	}

	addNodeWeight(node: NodeInterface, weights: Weights): void {
		if (!this.nodeWeights.has(node.ref)) {
			this.nodes.push(node);
			this.nodeWeights.set(node.ref, weights);
		}
	}

	toJSON(): EdgeJson {
		const conns = [];

		for (const [key, value] of this.nodeWeights.entries()) {
			conns.push({
				nodeRef: key,
				weights: value.toJSON(),
			});
		}

		return {
			ref: this.ref,
			weights: this.weights.toJSON(),
			connections: conns,
		};
	}
}
