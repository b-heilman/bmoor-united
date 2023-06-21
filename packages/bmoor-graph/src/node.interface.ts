import {Weights} from './weights';
import {WeightData} from './weights.interface';

export type NodeReference = string;

export type NodeType = string;

export type NodeTag = string;

// Nodes will no longer have any concept of an interval
// instead that will be a layer above, so each interval
// has its own graph under it.  I might do something with
// node reference the allows you to find all instances of a
// node across time, but for now I won't do that.
export interface NodeInterface {
	ref: NodeReference;
	type: NodeType;
	// TODO: this needs to be moved higher
	// Delta is the changes applied to the node
	// delta?: Weights;
	// State is the result of all deltas prior, but not this one
	weights?: Weights;
	// The alignment of nodes can change over time, so parent and children
	// should be defined here.
	parent?: NodeInterface;
	children?: Map<NodeType, NodeInterface[]>;
	// Technically, tags might change over time too
	tags?: NodeTag[];
}

export interface NodeJson {
	ref: NodeReference;
	type: NodeType;

	weights?: WeightData;
	// I could define an interval to maintain the relationship, but no event happens
	parentRef?: NodeReference;

	//
	tags?: NodeTag[];
}

export enum NodeValueSelector {
	node,
	edge,
}

export interface NodeChildSelector {
	type: NodeType;
}

export interface NodeSettings {
	tags?: NodeTag[];
	parent?: NodeInterface;
	weights?: Weights;
}

export type NodeOperator = (
	targetWeights: Weights,
	sourceWeights: Weights,
) => void;

export const NODE_DEFAULT_TYPE = '__DEFAULT__';

export interface NodePullSettings {
	continue?: (node: NodeInterface) => boolean;
}
