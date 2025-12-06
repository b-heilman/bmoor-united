import {
	DatumInterface,
	DatumReference,
	FeatureValue,
} from '@bmoor/compute';

import type {GraphInterface, GraphSelector} from '../graph.interface.ts';
import {NodeValueSelector} from '../node.interface.ts';
import {Node} from '../node.ts';
import type {
	GraphDatumInterface,
	GraphDatumSetterSettings,
} from './datum.interface.ts';

export class GraphDatum<
	SelectorT extends GraphSelector,
> implements GraphDatumInterface<SelectorT> {
	node: Node;
	graph: GraphInterface<GraphDatumInterface<SelectorT>, SelectorT>;
	awaiting: Map<string, Promise<FeatureValue>>;

	constructor(
		node: Node,
		graph: GraphInterface<GraphDatumInterface<SelectorT>, SelectorT>,
	) {
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
				nodeCollection.forEach((node) => {
					agg.set(node.ref, new GraphDatum(node, this.graph));
				});
			},
			new Map(),
		);
	}

	equals(other: DatumInterface<SelectorT>) {
		if (other instanceof GraphDatum) {
			return this.node === other.node && this.graph === other.graph;
		} else {
			return false;
		}
	}

	// get the value, could be an async source
	async getValue<ResponseT extends FeatureValue>(
		attr: string,
		generator?: () => Promise<ResponseT>,
		settings: GraphDatumSetterSettings = {},
	): Promise<ResponseT> {
		// event mode is the original source of truth, the node values are
		// what has been computed, etc.
		// TODO: implement fake and require logic in the higher level components
		if (generator) {
			const mode = settings.mode || NodeValueSelector.node;
			if (this.node.hasValue(attr, mode)) {
				return <ResponseT>(<unknown>this.node.getValue(attr, mode));
			} else if (this.awaiting.has(attr)) {
				return <Promise<ResponseT>>this.awaiting.get(attr);
			} else {
				const rtn = generator().then((val) => {
					// TODO: Datum => write value get-foo { value: 0 } {}
					//   that's wrong...
					if (!settings.fake) {
						this.awaiting.delete(attr);
						this.node.setValue(attr, mode, val);
					}

					return val;
				});

				this.awaiting.set(attr, rtn);

				return rtn;
			}
		} else {
			const mode = NodeValueSelector.event;
			if (this.node.hasValue(attr, mode)) {
				return <ResponseT>(<unknown>this.node.getValue(attr, mode));
			} else if (settings.require) {
				throw new Error(`Reading ${this.node.ref}`);
			} else {
				return null;
			}
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
