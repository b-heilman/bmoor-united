import {DatumInterface} from '@bmoor/compute';
import {GraphDatum, GraphSelector, Node} from '@bmoor/graph';

import type {GraphComputeDatumInterface} from './datum.interface.ts';
import type {
	GraphComputeInterface,
	GraphComputeSelector,
} from './graph.interface.ts';
import type {GraphComputeSectionInterface} from './graph/section.interface.ts';

export class GraphComputeDatum<SelectorT extends GraphComputeSelector>
	extends GraphDatum<SelectorT>
	implements GraphComputeDatumInterface<SelectorT>
{
	graph: GraphComputeSectionInterface<SelectorT>;
	global: GraphComputeInterface<
		GraphComputeDatumInterface<SelectorT>,
		SelectorT
	>;

	constructor(
		node: Node,
		graph: GraphComputeSectionInterface<SelectorT>,
		global: GraphComputeInterface<
			GraphComputeDatumInterface<GraphSelector>,
			GraphSelector
		>,
	) {
		super(node, graph);

		this.global = global;
	}

	equals(other: DatumInterface<GraphSelector>) {
		if (other instanceof GraphComputeDatum) {
			return other.global === this.global && super.equals(other);
		} else {
			return false;
		}
	}

	select(select: SelectorT): GraphComputeDatumInterface<SelectorT>[] {
		if (select.interval || select.across) {
			return this.global.select(this, select);
		} else if (select.root) {
			return this.graph.select(this, select);
		} else {
			return this.node
				.select(select)
				.map(
					(node) => new GraphComputeDatum(node, this.graph, this.global),
				);
		}
	}
}
