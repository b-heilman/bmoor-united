import {DatumInterface} from '@bmoor/compute';
import {
	Node,
	NodeReference,
	NodeSelector,
	NodeValueSelector,
} from '@bmoor/graph';

export class GraphDatum implements DatumInterface<NodeSelector> {
	ref: NodeReference;
	mode: NodeValueSelector;
	node: Node;

	constructor(node: Node, mode: NodeValueSelector) {
		this.ref = node.ref;
		this.mode = mode;
		this.node = node;
	}

	hasValue(attr: string): boolean {
		return this.node.hasValue(attr, this.mode);
	}

	// get the value, could be an async source
	async getValue(attr: string): Promise<number> {
		return this.node.getValue(attr, this.mode);
	}

	// set the value
	async setValue(attr: string, value: number): Promise<boolean> {
		this.node.setWeight(attr, value);

		return true;
	}

	select(select: NodeSelector): GraphDatum[] {
		return this.node
			.select(select)
			.map((node) => new GraphDatum(node, select.mode || this.mode));
	}
}
