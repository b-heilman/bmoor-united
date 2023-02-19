import {Interval, IntervalReference} from './interval.interface';
import {NodeInterface, NodeType} from './node.interface';
import {Weights} from './weights';
import {WeightData} from './weights.interface';

export type EventReference = string;

export type EventNodeIndex = Map<NodeType, NodeInterface[]>;

export interface EventJson {
	ref: EventReference;
	intervalRef: IntervalReference;
	weights: WeightData;
}

export interface EventInterface {
	ref: EventReference;
	interval: Interval;
	weights: Weights;
	nodes: EventNodeIndex;
}
