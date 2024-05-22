import {
	DatumInterface,
	DatumSetterSettings,
	FeatureValue,
} from '@bmoor/compute';

import {GraphInterface, GraphSelector} from '../graph.interface';
import {Node} from '../node';
import {NodeReference, NodeValueSelector} from '../node.interface';

export interface GraphDatumSetterSettings extends DatumSetterSettings {
	mode?: NodeValueSelector;
}

export interface GraphDatumInterface
	extends DatumInterface<GraphSelector> {
	ref: NodeReference;
	node: Node;
	graph: GraphInterface;
	awaiting: Map<string, Promise<FeatureValue>>;

	getValue(
		attr: string,
		generator: () => Promise<FeatureValue>,
		settings: GraphDatumSetterSettings,
	): Promise<FeatureValue>;
}
