import {Weights} from './weighted.interface';
import {Weighted} from './weighted';
import {Edge} from './edge';
import {NodeInterface} from './node.interface';
import { EventJSON, EventOrder, EventReference } from './event.interface';

export class Event extends Weighted {
	ref: EventReference;
	order: EventOrder;
	edges: Map<string, Map<NodeInterface, Edge>>;

	constructor(ref: EventReference, order: EventOrder) {
		super();

		this.ref = ref;
		this.order = order;
		this.edges = new Map();
	}

	addEdge(edge: Edge) {
		const node = edge.node;

		const types = this.edges.get(node.type);

		if (types){
			types.set(node, edge);
		} else {
			this.edges.set(node.type, (new Map()).set(node, edge))
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
				Object.assign(
					weights, 
					settings.labeler(
						from,
						to
					)
				);
			}

			return weights;
		});
	}

	toJSON(): EventJSON {
		return {
			ref: this.ref,
			weights: this.weights,
			edges: Array.from(this.edges).flatMap(
				([key, edgeMap]) => Array.from(edgeMap).map(([ley, edge]) => edge.toJSON())
			)
		};
	}
}
