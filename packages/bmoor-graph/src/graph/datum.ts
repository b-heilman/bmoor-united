import {DatumInterface, FeatureValue} from '@bmoor/compute';

import {GraphInterface} from '../graph.interface';
import {GraphSelector} from '../graph.interface';
import {Node} from '../node';
import {
	NodeReference,
	NodeSelector,
	NodeValueSelector,
} from '../node.interface';

export class GraphDatum implements DatumInterface<GraphSelector> {
	ref: NodeReference;
	node: Node;
	graph: GraphInterface;

	constructor(node: Node, graph: GraphInterface) {
		this.ref = node.ref;
		this.node = node;
		this.graph = graph;
	}

	equals(other: GraphDatum) {
		return this.node === other.node;
	}

	hasValue(
		attr: string,
		mode: NodeValueSelector = NodeValueSelector.node,
	): boolean {
		return this.node.hasValue(attr, mode);
	}

	async awaitValue(attr: string, prom: Promise<number>): Promise<boolean> {
		this.node.setWeight(attr, prom);

		return prom.then((value) => this.setValue(attr, value));
	}

	// get the value, could be an async source
	async getValue(
		attr: string,
		mode: NodeValueSelector = NodeValueSelector.node,
	): Promise<FeatureValue> {
		return this.node.getValue(attr, mode);
	}

	// set the value
	async setValue(attr: string, value: FeatureValue): Promise<boolean> {
		this.node.setWeight(attr, value);

		return true;
	}

	select(select: GraphSelector): DatumInterface<GraphSelector>[] {
		if (select.global) {
			return this.graph.select(select);
		} else {
			return this.node
				.select(select)
				.map((node) => new GraphDatum(node, this.graph));
		}
	}
}
