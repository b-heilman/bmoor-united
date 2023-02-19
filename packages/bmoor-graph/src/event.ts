import {
	EventJson,
	EventNodeIndex,
	EventReference,
} from './event.interface';
import {Interval} from './interval';
import {NodeInterface} from './node.interface';
import {Weights} from './weights';

export class Event {
	ref: EventReference;
	interval: Interval;
	weights: Weights;
	nodes: EventNodeIndex;

	constructor(ref: EventReference, interval: Interval) {
		this.ref = ref;
		this.nodes = new Map();
		this.weights = new Weights();
		this.interval = interval;
	}

	addNode(node: NodeInterface) {
		const types = this.nodes.get(node.type);

		if (types) {
			types.push(node);
		} else {
			this.nodes.set(node.type, [node]);
		}
	}

	/*
	TODO: toDateFrame
	computeDataFrame(
		compute: (
			nodeA: NodeInterface,
			nodeB: NodeInterface,
			edgeA: Edge,
			edgeB: Edge
		) => Weights,
		settings: {
			labeler?: (edgeA: Edge, edgeB: Edge) => Weights;
		} = {}
	): Weights[] {
		// TODO: make this do proper permutations?
		const edges = this.nodes.values();
		const edgeA = edges.next().value;
		const edgeB = edges.next().value;

		const sets = [
			{
				from: edgeA,
				to: edgeB
			},
			{
				from: edgeB,
				to: edgeA
			}
		];

		return sets.map(({from, to}) => {
			const weights = compute(from.from, to.from, from, to);

			if (settings.labeler) {
				Object.assign(weights, settings.labeler(from, to));
			}

			return weights;
		});
	}
	*/

	toJSON(): EventJson {
		return {
			ref: this.ref,
			intervalRef: this.interval.ref,
			weights: this.weights.toJSON(),
		};
	}
}
