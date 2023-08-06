import {GraphSelector} from '../graph.interface';
import {Node} from '../node';
import {NodeSelector} from '../node.interface';
import {GraphDatum} from './datum';

export class GraphSelection {
	selector: GraphSelector;
	datums: GraphDatum[];

	constructor(select: GraphSelector, nodes: Node[] | GraphDatum[]) {
		this.selector = select;

		if (nodes[0] instanceof GraphDatum) {
			this.datums = <GraphDatum[]>nodes;
		} else {
			this.datums = nodes.map((node) => new GraphDatum(node, select.mode));
		}
	}

	filter(select: NodeSelector): GraphSelection {
		if (select.metadata) {
			let datums = this.datums;

			for (const [mount, tag] of Object.entries(select.metadata)) {
				datums = datums.filter((datum) =>
					datum.node.searchMetadata(mount, tag),
				);
			}

			return new GraphSelection(select, datums);
		} else {
			return this;
		}
	}

	unique(): GraphSelection {
		const map = new Map();

		for (const datum of this.datums) {
			if (!map.has(datum.node.ref)) {
				map.set(datum.node.ref, datum);
			}
		}

		return new GraphSelection(this.selector, Array.from(map.values()));
	}
}
