import {DatumInterface, FeatureValue} from '@bmoor/compute';

import {GraphInterface, GraphSelector} from '../graph.interface';
import {Node} from '../node';
import {NodeReference, NodeValueSelector} from '../node.interface';
import {
	GraphDatumInterface,
	GraphDatumSetterSettings,
} from './datum.interface';

export class GraphDatum implements GraphDatumInterface {
	ref: NodeReference;
	node: Node;
	graph: GraphInterface;
	awaiting: Map<string, Promise<FeatureValue>>;

	constructor(node: Node, graph: GraphInterface) {
		this.ref = node.ref;
		this.node = node;
		this.graph = graph;
		this.awaiting = new Map();
	}

	equals(other: DatumInterface<GraphSelector>) {
		if (other instanceof GraphDatum) {
			return this.node === other.node;
		} else {
			return false;
		}
	}

	// get the value, could be an async source
	async getValue(
		attr: string,
		generator: () => Promise<FeatureValue>,
		settings: GraphDatumSetterSettings,
	): Promise<FeatureValue> {
		const mode = settings.mode || NodeValueSelector.node;
		if (this.awaiting.has(attr)) {
			return <Promise<FeatureValue>>this.awaiting.get(attr);
		} else if (this.node.hasValue(attr, mode)) {
			return this.node.getValue(attr, mode);
		} else {
			const rtn = generator();

			rtn.then((val) => {
				if (!settings.fake) {
					this.awaiting.delete(attr);
					this.node.setValue(attr, mode, val);
				}

				return val;
			});

			this.awaiting.set(attr, rtn);

			return rtn;
		}
	}

	// set the value
	async setValue(attr: string, value: FeatureValue): Promise<boolean> {
		this.node.setWeight(attr, value);

		return true;
	}

	select(select: GraphSelector): GraphDatumInterface[] {
		if (select.global) {
			return this.graph.select(select);
		} else {
			return this.node
				.select(select)
				.map((node) => new GraphDatum(node, this.graph));
		}
	}
}
