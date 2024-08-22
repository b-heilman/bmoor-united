import {
	DatumInterface,
	DatumReference,
	DatumSetterSettings,
	FeatureValue,
} from '@bmoor/compute';

import {GraphInterface, GraphSelector} from '../graph.interface';
import {Node} from '../node';
import {NodeValueSelector} from '../node.interface';

export interface GraphDatumSetterSettings extends DatumSetterSettings {
	mode?: NodeValueSelector;
}

export interface GraphDatumInterface<SelectorT extends GraphSelector>
	extends DatumInterface<SelectorT> {
	node: Node;
	graph: GraphInterface<GraphDatumInterface<SelectorT>, SelectorT>;

	getReference(): DatumReference;
	getParent(): GraphDatumInterface<SelectorT>;
	getChildren(): Map<DatumReference, GraphDatumInterface<SelectorT>>;

	equals(other: GraphDatumInterface<SelectorT>): boolean;

	getValue<ResponseT extends FeatureValue>(
		attr: string,
		generator: () => Promise<ResponseT>,
		settings: GraphDatumSetterSettings,
	): Promise<ResponseT>;

	select(selector: SelectorT): GraphDatumInterface<SelectorT>[];
}
