import {
	EventInterface,
	EventJSON,
	EventReference,
} from './event.interface';
import {Features} from './features';
import {
	NodeInterface,
	NodeJSON,
	NodeReference,
	NodeSelector,
	NodeType,
} from './node.interface';

export interface GraphSelector extends NodeSelector {
	reference?: NodeReference;
}

export interface GraphEventFeatures {
	eventFeatures: Features;
	nodeFeatures: Features;
}

export interface GraphInterface {
	types: Map<NodeType, NodeInterface[]>;
	nodeDex: Map<NodeReference, NodeInterface>;
	eventDex: Map<EventReference, EventInterface>;
	connectionDex: Map<NodeReference, EventInterface[]>;

	addNode(node: NodeInterface): void;
	getNode(ref: NodeReference): NodeInterface;
	addEvent(event: EventInterface): void;
	getEvents(ref: NodeReference): EventInterface[];
	getEventFeatures(ref: NodeReference): GraphEventFeatures[];
	// some search methods
}

export interface GraphJSON {
	nodes: NodeJSON[];
	events: EventJSON[];
}

export interface GraphBuilder {
	nodes: Map<NodeReference, NodeInterface>;
	events: EventJSON[];
}
