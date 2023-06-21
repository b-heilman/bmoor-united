import {EdgeInterface, EdgeJson} from './edge.interface';
import {
	NodeInterface,
	NodeJson,
	NodeReference,
	NodeType,
	NodeTag
} from './node.interface';
import {Weights} from './weights';

export interface GraphSelector {
	reference?: NodeReference,
	type?: NodeType,
	tag?: NodeTag,
}

export interface GraphEdgeWeights {
	edgeWeights: Weights,
	nodeWeights: Weights,
}

export interface GraphInterface {
	top: NodeInterface[];
	edges: EdgeInterface[];
	types: Map<NodeType, NodeInterface[]>;
	nodeDex: Map<NodeReference, NodeInterface>;
	edgeDex: Map<NodeReference, EdgeInterface[]>;

	addNode(node: NodeInterface): void;
	getNode(ref: NodeReference): NodeInterface;
	addEdge(edge: EdgeInterface): void;
	getEdges(ref: NodeReference): EdgeInterface[];
	getEdgeWeights(ref: NodeReference): GraphEdgeWeights[];
	biConnectNodes(
		edgeWeights: Weights,
		ref1: NodeReference,
		weights1: Weights,
		ref2: NodeReference,
		weights2: Weights,
	): EdgeInterface;
	// some search methods
}

export interface GraphJson {
	nodes: NodeJson[];
	edges: EdgeJson[];
}
