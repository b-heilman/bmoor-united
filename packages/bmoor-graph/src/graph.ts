import {DatumInterface} from '@bmoor/compute';

import {Edge} from './edge';
import {Event} from './event';
import {
	EventFeaturesWriteMode,
	EventJSON,
	EventReference,
} from './event.interface';
import {Features} from './features';
import {
	GraphBuilder,
	GraphEventFeatures,
	GraphInterface,
	GraphJSON,
	GraphNodeSelector,
	GraphSelector,
} from './graph.interface';
import {GraphDatum} from './graph/datum';
import {Node} from './node';
import {
	NODE_DEFAULT_TYPE,
	NodeJSON,
	NodeReference,
	NodeSelector,
	NodeType,
} from './node.interface';

// used to manage all top levels nodes and then facilitates
// passing data through them
function connect(graph: Graph, node: Node, event: Event) {
	let arr = graph.connectionDex.get(node.ref);

	if (!arr) {
		arr = [];

		graph.connectionDex.set(node.ref, arr);
	}

	arr.push(event);

	node.addEvent(event);
}

export class Graph implements GraphInterface {
	types: Map<NodeType, Node[]>;
	global: Node;
	nodeDex: Map<NodeReference, Node>;
	eventDex: Map<EventReference, Event>;
	connectionDex: Map<NodeReference, Event[]>;

	constructor() {
		this.types = new Map();
		this.global = new Node('global', '__super__');
		this.nodeDex = new Map();
		this.eventDex = new Map();
		this.connectionDex = new Map();
	}

	addNode(node: Node): void {
		// TODO: should this not be an exception?
		if (!this.nodeDex.has(node.ref)) {
			this.nodeDex.set(node.ref, node);

			let arr = this.types.get(node.type);
			if (!arr) {
				arr = [];

				this.types.set(node.type, arr);
			}

			arr.push(node);

			if (!node.parent) {
				this.global.addChild(node);
			}
		}
	}

	getNode(ref: NodeReference): Node {
		if (ref === this.global.ref) {
			return this.global;
		} else {
			return this.nodeDex.get(ref);
		}
	}

	hasNode(ref: NodeReference): boolean {
		return this.nodeDex.has(ref);
	}

	addEvent(event: Event): void {
		this.eventDex.set(event.ref, event);

		for (const {node} of event.nodeInfo.values()) {
			connect(this, <Node>node, event);
			(<Node>node).addEvent(event);
		}
	}

	getEvent(ref: EventReference): Event {
		return this.eventDex.get(ref);
	}

	hasEvent(ref: EventReference): boolean {
		return this.eventDex.has(ref);
	}

	getEvents(ref: NodeReference): Event[] {
		return this.connectionDex.get(ref);
	}

	getEventFeatures(ref: NodeReference): GraphEventFeatures[] {
		const events = this.getEvents(ref);

		return events.map((event) => ({
			eventFeatures: event.features,
			nodeFeatures: event.nodeInfo.get(ref).features,
		}));
	}

	select(selector: GraphSelector): DatumInterface<NodeSelector>[] {
		let select = <GraphNodeSelector>selector;
		let res: Node[] = null;

		if (selector.global) {
			res = [this.global];
		} else if (selector.reference) {
			res = [this.getNode(selector.reference)];
		} else {
			res = this.types.get(selector.type);
			select = Object.assign({}, selector, {type: null}); // so it doesn't run again
		}

		const rtn = [...new Set(res.flatMap((node) => node.select(select)))];

		return rtn.map((node) => new GraphDatum(node, this));
	}

	toJSON(): GraphJSON {
		const nodes = [];

		for (const node of this.nodeDex.values()) {
			if (node !== this.global) {
				nodes.push(node.toJSON(this.global));
			}
		}

		const events = Array.from(this.eventDex.values()).map((event) =>
			event.toJSON(),
		);

		return {
			nodes,
			events,
		};
	}
}

export function dump(graph: Graph): GraphJSON {
	return graph.toJSON();
}

export function prepareNodeJSON(
	builder: GraphBuilder,
	nodeInfo: NodeJSON,
): Node {
	const dex = builder.nodes;

	let node = <Node>dex.get(nodeInfo.ref);

	if (!node) {
		node = new Node(nodeInfo.ref);

		dex.set(node.ref, node);
	}

	if (nodeInfo.type && node.type === NODE_DEFAULT_TYPE) {
		node.type = nodeInfo.type;
	}

	if (nodeInfo.parentRef && !node.hasParent()) {
		node.setParent(
			prepareNodeJSON(builder, {
				ref: nodeInfo.parentRef,
			}),
		);
	}

	if (nodeInfo.features) {
		node.addFeatures(nodeInfo.features);
	}

	if (nodeInfo.metadata && !node.hasMetadata()) {
		node.setMetadata(nodeInfo.metadata);
	}

	if (nodeInfo.edges && !node.hasEdges()) {
		for (const label in nodeInfo.edges) {
			const edgeSet = nodeInfo.edges[label];

			for (const ref of edgeSet) {
				node.addEdge(new Edge(label, prepareNodeJSON(builder, {ref})));
			}
		}
	}

	return node;
}

function addEventJSON(graph: Graph, eventInfo: EventJSON) {
	let event = null;

	if (graph.hasEvent(eventInfo.ref)) {
		event = graph.getEvent(eventInfo.ref);
	} else {
		// TODO: should I use _collision here?
		event = new Event(eventInfo.ref, new Features(eventInfo.features));

		graph.addEvent(event);
	}

	for (const conn of eventInfo.connections) {
		// when the event is added, no weights have been applied
		connect(graph, graph.getNode(conn.nodeRef), event);

		event.setNodeFeatures(
			graph.getNode(conn.nodeRef),
			new Features(conn.features),
			conn.collision || EventFeaturesWriteMode.ignore,
		);
	}
}

export function applyBuilder(graph: Graph, builder: GraphBuilder) {
	for (const node of builder.nodes.values()) {
		graph.addNode(<Node>node);
	}

	for (const eventInfo of builder.events) {
		addEventJSON(graph, eventInfo);
	}
}

export function load(source: GraphJSON): Graph {
	const graph = new Graph();
	const builder = {
		nodes: new Map(),
		events: source.events,
	};

	for (const nodeInfo of source.nodes) {
		prepareNodeJSON(builder, nodeInfo);
	}

	applyBuilder(graph, builder);

	return graph;
}
