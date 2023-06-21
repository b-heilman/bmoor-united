import {NodeInterface, NodeReference} from './node.interface';
import {Weights} from './weights';
import {WeightData} from './weights.interface';

export type EdgeReference = string;

/**
 * NOTE: an edge will only have on weight, that would be something
 * like the game conditions for the day.  Each node would have
 * its own weight for that 'day', which is the current state, and
 * a reference in the node weights which is any changes to be applied
 * goinng forward.  Results of the day it could be considered.
 */
export interface EdgeInterface {
	ref: EdgeReference;
	weights: Weights;
	nodes: NodeInterface[];
	nodeWeights: Map<NodeReference, Weights>;

	addNodeWeight(node: NodeInterface, weights: Weights): void;
}

export interface EdgeJson {
	ref: EdgeReference;
	weights: WeightData;
	connections: {
		nodeRef: NodeReference;
		weights: WeightData;
	}[];
}
