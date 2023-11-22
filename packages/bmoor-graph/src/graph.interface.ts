import {DatumInterface} from '@bmoor/compute';

import {
	EventInterface,
	EventJSON,
	EventReference,
} from './event.interface';
import {Features} from './features';
import {
	NodeBuilder,
	NodeInterface,
	NodeJSON,
	NodeReference,
	NodeSelector,
	NodeType,
} from './node.interface';

export interface GraphNodeSelector extends NodeSelector {
	global?: boolean;
	reference?: NodeReference;
}

export type GraphSelector = GraphNodeSelector;

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

	select(selector: GraphSelector): DatumInterface<NodeSelector>[];
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
