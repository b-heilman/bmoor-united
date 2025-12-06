import {
	EventInterface,
	EventJSON,
	EventReference,
} from './event.interface.ts';
import {Features} from './features.ts';
import {GraphDatumInterface} from './graph/datum.interface.ts';
import {
	NodeBuilder,
	NodeInterface,
	NodeJSON,
	NodeReference,
	NodeSelector,
	NodeType,
} from './node.interface.ts';

export interface GraphSelector extends NodeSelector {
	root?: boolean;
	and?: GraphSelector[];
}

export interface GraphEventFeatures {
	eventFeatures: Features;
	nodeFeatures: Features;
}

export interface GraphInterface<
	DatumT extends GraphDatumInterface<SelectorT>,
	SelectorT extends GraphSelector,
> {
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

	select(datum: DatumT, selector: SelectorT): DatumT[];
}

export interface GraphJSON {
	root: NodeJSON;
	nodes: NodeJSON[];
	events: EventJSON[];
}

export interface GraphBuilder {
	nodes: NodeBuilder;
	events: EventJSON[];
}
