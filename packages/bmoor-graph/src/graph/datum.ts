import {DatumInterface} from '@bmoor/compute';
import {
	GraphInterface,
	Node,
	NodeReference,
	NodeSelector,
	NodeValueSelector,
} from '@bmoor/graph';

export class GraphDatum implements DatumInterface<NodeSelector> {
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

	// get the value, could be an async source
	async getValue(
		attr: string,
		mode: NodeValueSelector = NodeValueSelector.node,
	): Promise<number> {
		return this.node.getValue(attr, mode);
	}

	// set the value
	async setValue(attr: string, value: number): Promise<boolean> {
		this.node.setWeight(attr, value);

		return true;
	}

	select(select: NodeSelector): DatumInterface<NodeSelector>[] {
		if (select.global) {
			return this.graph.select(select);
		} else {
			return this.node
				.select(select)
				.map((node) => new GraphDatum(node, this.graph));
		}
	}
}
