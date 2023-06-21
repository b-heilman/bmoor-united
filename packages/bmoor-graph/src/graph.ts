import {Edge} from './edge';
import {GraphEdgeWeights, GraphInterface, GraphJson, GraphSelector} from './graph.interface';
import {Node} from './node';
import {NodeReference, NodeType} from './node.interface';
import {Weights} from './weights';

// used to manage all top levels nodes and then facilitates
// passing data through them
function connect(graph: Graph, node: Node, edge: Edge) {
	let arr = graph.edgeDex.get(node.ref);

	if (!arr) {
		arr = [];

		graph.edgeDex.set(node.ref, arr);
	}

	arr.push(edge);

	node.addEdge(edge);
}

export class Graph implements GraphInterface {
	top: Node[];
	edges: Edge[];
	types: Map<NodeType, Node[]>;
	weights: Weights;
	nodeDex: Map<NodeReference, Node>;
	edgeDex: Map<NodeReference, Edge[]>;

	constructor(){
		this.top = [];
		this.edges = [];
		this.types = new Map();
		this.weights = new Weights();
		this.nodeDex = new Map();
		this.edgeDex = new Map();
	}

	addNode(node: Node): void {
		if (!this.nodeDex.has(node.ref)) {
			if (!node.parent) {
				this.top.push(node);
			}

			this.nodeDex.set(node.ref, node);

			let arr = this.types.get(node.type);
			if (!arr) {
				arr = [];

				this.types.set(node.type, arr);
			}

			arr.push(node);
		}
	}

	getNode(ref: NodeReference): Node {
		return this.nodeDex.get(ref);
	}

	hasNode(ref: NodeReference): boolean {
		return this.nodeDex.has(ref);
	}

	addEdge(edge: Edge): void {
		for (const node of edge.nodes){
			connect(this, <Node>node, edge);
		}

		this.edges.push(edge);
	}

	biConnectNodes(
		edgeWeights: Weights,
		ref1: NodeReference,
		weights1: Weights,
		ref2: NodeReference,
		weights2: Weights,
	): Edge {
		const node1 = this.getNode(ref1);
		const node2 = this.getNode(ref2);
	
		const edge = new Edge(node1.ref + ':' + node2.ref, edgeWeights);

		edge.addNodeWeight(node1, weights1);
		edge.addNodeWeight(node2, weights2);

		this.addEdge(edge);

		return edge;
	}

	getEdges(ref: NodeReference): Edge[] {
		return this.edgeDex.get(ref);
	}

	getEdgeWeights(ref: NodeReference): GraphEdgeWeights[] {
		const edges = this.getEdges(ref);

		return edges.map(
			edge => ({
				edgeWeights: edge.weights,
				nodeWeights: edge.nodeWeights.get(ref)
			})
		);
	}

	select(select: GraphSelector): Node[] {
		let rtn: Node[] = null;

		if (select.reference && select.type){
			const node = this.getNode(select.reference);

			rtn = node.getChildren({type: select.type}, true);
		} else if (select.reference){
			rtn = [this.getNode(select.reference)];
		} else {
			rtn = this.types.get(select.type);
		}

		if (select.tag){
			return rtn.filter(node => node.hasTag(select.tag));
		} else {
			return rtn;
		}
	}

	subSelect(node: Node, select: GraphSelector): Node[] {
		let rtn: Node[] = null;

		if (select === null) {
			// return all leaves
			rtn = node.getChildren(null, true);
		} else if (select.reference) {
			// TODO: do I want to support reference for children?
			throw new Error('Can no subselect by reference');
		} else {
			rtn = node.getChildren({type: select.type}, true);
		}

		if (select.tag) {
			return rtn.filter((node) => node.hasTag(select.tag));
		} else {
			return rtn;
		}
	}

	toJSON(): GraphJson {
		const nodes = [];

		for (const node of this.nodeDex.values()) {
			nodes.push(node.toJSON());
		}

		const edges = this.edges.map((edge) => edge.toJSON());

		return {
			nodes,
			edges,
		};
	}
}

export function dump(graph: Graph): GraphJson {
	return graph.toJSON();
}

export function load(source: GraphJson): Graph {
	const graph = new Graph();

	for (const nodeInfo of source.nodes){
		const node = new Node(
			nodeInfo.ref,
			nodeInfo.type,
			{
				tags: nodeInfo.tags,
				weights: new Weights(nodeInfo.weights)
			}
		);

		if (nodeInfo.parentRef){
			const parent = graph.getNode(nodeInfo.parentRef);

			node.setParent(parent);
		}

		graph.addNode(node);
	}

	for(const edgeInfo of source.edges){
		const edge = new Edge(
			edgeInfo.ref, 
			new Weights(edgeInfo.weights)
		);

		for (const conn of edgeInfo.connections){
			edge.addNodeWeight(
				graph.getNode(conn.nodeRef),
				new Weights(conn.weights)
			);
		}

		graph.addEdge(edge);
	}

	return graph;
}
