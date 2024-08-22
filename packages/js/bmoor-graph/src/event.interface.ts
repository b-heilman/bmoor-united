import {Features} from './features';
import {FeatureValues} from './features.interface';
import {NodeInterface, NodeReference} from './node.interface';

export type EventReference = string;

export enum EventFeaturesWriteMode {
	overwrite = 'overwrite',
	merge = 'merge',
	verify = 'verify',
	fail = 'fail',
	ignore = 'ignore',
}

export interface EventNodeInformation {
	node: NodeInterface;
	features: Features;
}

/**
 * NOTE: an event will only have on weight, that would be something
 * like the game conditions for the day.  Each node would have
 * its own weight for that 'day', which is the current state, and
 * a reference in the node features which is any changes to be applied
 * goinng forward.  Results of the day it could be considered.
 */
export interface EventInterface {
	ref: EventReference;
	features: Features;
	nodeInfo: Map<NodeReference, EventNodeInformation>;

	setNodeFeatures(node: NodeInterface, features: Features): void;
	getNodeFeatures(node: NodeInterface | NodeReference): Features;
	hasNodeFeature(
		node: NodeInterface | NodeReference,
		mount: string,
	): boolean;
}

export interface EventJSON {
	ref: EventReference;
	features?: FeatureValues;
	connections: {
		nodeRef: NodeReference;
		features: FeatureValues;
		collision?: EventFeaturesWriteMode;
	}[];
}
