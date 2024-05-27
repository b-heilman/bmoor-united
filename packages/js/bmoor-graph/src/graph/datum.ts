import {DatumInterface, FeatureValue, DatumReference} from '@bmoor/compute';

import {GraphInterface, GraphSelector} from '../graph.interface';
import {Node} from '../node';
import {NodeValueSelector} from '../node.interface';
import {
	GraphDatumInterface,
	GraphDatumSetterSettings,
} from './datum.interface';

export class GraphDatum<SelectorT extends GraphSelector> 
	implements GraphDatumInterface<SelectorT> {
	node: Node;
	graph: GraphInterface<SelectorT>;
	awaiting: Map<string, Promise<FeatureValue>>;

	constructor(node: Node, graph: GraphInterface<SelectorT>) {
		// this.ref = node.ref;
		this.node = node;
		this.graph = graph;
		this.awaiting = new Map();
	}

	getReference(): DatumReference {
		return this.node.ref;
	}

	getParent(): GraphDatumInterface<SelectorT> {
		return new GraphDatum(this.node.parent, this.graph);
	}

	getChildren(): Map<DatumReference, GraphDatumInterface<SelectorT>> {
		return Object.values(this.node.children).reduce(
			(agg, nodeCollection) => {
				nodeCollection.forEach(node => {
					agg.set(node.ref, new GraphDatum(node, this.graph));
				});
			},
			new Map()
		)
	}

	equals(other: DatumInterface<SelectorT>) {
		if (other instanceof GraphDatum) {
			return this.node === other.node && this.graph === other.graph;
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

	select(select: SelectorT): GraphDatumInterface<SelectorT>[] {
		if (select.root) {
			return this.graph.select(this, select);
		} else {
			return this.node
				.select(select)
				.map((node) => new GraphDatum(node, this.graph));
		}
	}
}
