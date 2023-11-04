import {EdgeInterface, EdgeLabel} from './edge.interface';
import {Features} from './features';
import {FeatureValues} from './features.interface';

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
	// delta?: Features;
	// State is the result of all deltas prior, but not this one
	features: Features;
	// The alignment of nodes can change over time, so parent and children
	// should be defined here.
	parent?: NodeInterface;
	children: Map<NodeType, NodeInterface[]>;
	edges: Map<EdgeLabel, EdgeInterface[]>;
	// Technically, tags might change over time too
	metadata: Map<string, NodeTag>;
}

export interface NodeJSON {
	ref: NodeReference;
	type?: NodeType;

	// TODO: I probably should rename this to features...
	features?: FeatureValues;
	// I could define an interval to maintain the relationship, but no event happens
	parentRef?: NodeReference;

	//
	metadata?: Record<string, NodeTag>;

	edges?: Record<EdgeLabel, NodeReference[]>;
}

export enum NodeValueSelector {
	node,
	event,
}

export interface NodeSelector {
	global?: boolean;

	// TODO: where nodes are selected, order should matter
	//   make sure to standardize that.
	// search up the tree
	parent?: NodeType;

	edge?: EdgeLabel;

	// search across the connections
	sibling?: NodeType;

	// search down the tree
	type?: NodeType;

	// filter results based on this
	metadata?: Record<string, NodeTag>;
}

export interface NodeSettings {
	metadata?: Record<string, NodeTag>;
	parent?: NodeInterface;
	features?: FeatureValues;
}

export type NodeOperator = (
	targetFeatures: Features,
	sourceFeatures: Features,
) => void;

export const NODE_DEFAULT_TYPE = '__DEFAULT__';

export interface NodePullSettings {
	continue?: (node: NodeInterface) => boolean;
}

export type NodeBuilder = Map<
	string,
	{
		node: NodeInterface;
		stub: boolean;
	}
>;
