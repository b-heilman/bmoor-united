import {EdgeInterface, EdgeJson} from './edge.iterface';

import {Interval, IntervalReference} from './interval.interface';
import {NodeInterface, NodeType} from './node.interface';
import {Weights} from './weights';
import {WeightData} from './weights.interface';

export type EventReference = string;

export type EventNodeEdge = Map<
	NodeType,
	Map<NodeInterface, EdgeInterface>
>;

export interface EventJson {
	ref: EventReference;
	interval: IntervalReference;
	weights: WeightData;
	edges: EdgeJson[];
}

export interface EventInterface {
	ref: EventReference;
	interval: Interval;
	weights: Weights;
	edges: EventNodeEdge;
}
