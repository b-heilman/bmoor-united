import {Weights} from './weighted.interface';
import {Weighted} from './weighted';
import {Edge} from './edge';
import {NodeInterface} from './node.interface';

export class Event extends Weighted {
	ref: string;
	edges: Map<NodeInterface, Edge>;

	constructor(ref: string) {
		super();

		this.ref = ref;
		this.edges = new Map();
	}

	addEdge(edge: Edge) {
		this.edges.set(edge.from, edge);
	}

	getEdge(from: NodeInterface) {
		return this.edges.get(from);
	}

	getOther(from: NodeInterface) {
		return this.edges.get(from).to;
	}

	getOtherEdge(from: NodeInterface) {
		return this.edges.get(this.getOther(from));
	}

	computeDataFrame(
		compute: (
			nodeA: NodeInterface,
			nodeB: NodeInterface,
			edgeA: Edge,
			edgeB: Edge
		) => Weights,
		settings: {
			labeler?: (edgeA, edgeB) => number;
			labelMount?: string;
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
				weights[weights?.labelMount || 'label'] = settings.labeler(
					from,
					to
				);
			}

			return weights;
		});
	}

	toJSON() {
		return {
			ref: this.ref,
			weights: this.weights,
			edges: Array.from(this.edges.values()).map((edge) => edge.toJSON())
		};
	}
}
