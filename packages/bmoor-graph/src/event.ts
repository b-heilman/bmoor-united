import {Weights} from './weights';
import {Edge} from './edge';
import {NodeInterface} from './node.interface';
import {EventJson, EventReference, EventNodeEdge} from './event.interface';
import {Interval} from './interval.interface';

export class Event {
	ref: EventReference;
	interval: Interval;
	weights: Weights;
	edges: EventNodeEdge;

	constructor(ref: EventReference, interval: Interval) {
		this.ref = ref;
		this.edges = new Map();
		this.weights = new Weights();
		this.interval = interval;
	}

	addEdge(edge: Edge) {
		const node = edge.node;

		const types = this.edges.get(node.type);

		if (types) {
			types.set(node, edge);
		} else {
			this.edges.set(node.type, new Map().set(node, edge));
		}
	}

	getEdge(node: NodeInterface) {
		return this.edges.get(node.type).get(node);
	}

	// TODO: toDateFrame
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
		const edges = this.edges.values();
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

	toJSON(): EventJson {
		return {
			ref: this.ref,
			interval: this.interval.ref,
			weights: this.weights.data,
			edges: Array.from(this.edges).flatMap((edgeMap) =>
				Array.from(edgeMap[1]).map((edge) => (<Edge>edge[1]).toJSON())
			)
		};
	}
}
