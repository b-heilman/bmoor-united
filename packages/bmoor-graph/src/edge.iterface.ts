import {Weights} from './weights';
import {WeightData} from './weights.interface';
import {NodeInterface, NodeReference} from './node.interface';

export interface EdgeJson {
	node: NodeReference;
	weights: WeightData;
}

export interface EdgeInterface {
	node: NodeInterface;
	weights: Weights;
}
