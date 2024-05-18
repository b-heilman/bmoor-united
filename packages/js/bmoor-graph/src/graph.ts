import {DatumInterface} from '@bmoor/compute';
import {Context} from '@bmoor/context';

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
import {Node, load as loadNode} from './node';
import {NodeReference, NodeSelector, NodeType} from './node.interface';

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
	root: Node;
	nodeDex: Map<NodeReference, Node>;
	eventDex: Map<EventReference, Event>;
	connectionDex: Map<NodeReference, Event[]>;

	constructor(root?: Node) {
		this.types = new Map();
		this.root = root || new Node('__root__', 'root');
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
				this.root.addChild(node);
			}
		}
	}

	getNode(ref: NodeReference): Node {
		if (ref === this.root.ref) {
			return this.root;
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
			res = [this.root];
		} else if (selector.reference) {
			const selected = this.getNode(selector.reference);

			if (!selected) {
				throw new Error('Unable to select: ' + selector.reference);
			}

			res = [selected];
		} else {
			res = this.types.get(selector.type);
			select = Object.assign({}, selector, {type: null}); // so it doesn't run again
		}

		let rtn: GraphDatum[] = [
			...new Set(res.flatMap((node) => node.select(select))),
		].map((node) => new GraphDatum(node, this));

		if (selector.and) {
			for (const subSelector of selector.and) {
				rtn = rtn.concat(<GraphDatum[]>this.select(subSelector));
			}
		}

		return rtn;
	}

	toJSON(): GraphJSON {
		const nodes = [];

		for (const node of this.nodeDex.values()) {
			if (node !== this.root) {
				nodes.push(node.toJSON(this.root));
			}
		}

		const events = Array.from(this.eventDex.values()).map((event) =>
			event.toJSON(),
		);

		return {
			root: this.root.toJSON(),
			nodes,
			events,
		};
	}
}

export function dump(graph: Graph): GraphJSON {
	return graph.toJSON();
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

export function applyBuilder(
	ctx: Context,
	graph: Graph,
	builder: GraphBuilder,
) {
	for (const info of builder.nodes.values()) {
		if (info.stub) {
			throw new Error('node stubbed but never defined: ' + info.node.ref);
		} else if (graph.root === info.node) {
			continue;
		}

		try {
			graph.addNode(<Node>info.node);
		} catch (ex) {
			if (ex instanceof Error) {
				ctx.setError(ex, {
					code: 'GRAPH_ADD_NODE',
					protected: info.node,
				});
			}

			throw ex;
		}
	}

	for (const eventInfo of builder.events) {
		addEventJSON(graph, eventInfo);
	}
}

export function load(ctx: Context, source: GraphJSON): Graph {
	const builder = {
		nodes: new Map(),
		events: source.events,
	};

	let root = null;
	try {
		root = loadNode(source.root, builder.nodes);
	} catch (ex) {
		if (ex instanceof Error) {
			ctx.setError(ex, {
				code: 'GRAPH_ROOT_NODE',
				protected: source.root,
			});
		}

		throw ex;
	}

	const graph = new Graph(root);

	for (const nodeInfo of source.nodes) {
		try {
			loadNode(nodeInfo, builder.nodes);
		} catch (ex) {
			if (ex instanceof Error) {
				ctx.setError(ex, {
					code: 'GRAPH_LOAD_NODE',
					protected: nodeInfo,
				});
			}

			throw ex;
		}
	}

	applyBuilder(ctx, graph, builder);

	return graph;
}