import {EventInterface, EventReference} from './event.interface';
import {Interval} from './interval';
import {IntervalReference} from './interval.interface';
import {Weights} from './weights';
import {WeightData} from './weights.interface';

export type NodeReference = string;

export type NodeType = string;

export type NodeTag = string;

export interface NodeIntervalData {
	weights?: Weights;
	edgeWeights?: Weights;
	event?: EventInterface;
	parent?: NodeInterface;
	children?: NodeInterface[];
}

export interface NodeInterface {
	ref: NodeReference;
	type: NodeType;
	tags?: string[];
	intervals: Map<Interval, NodeIntervalData>;
}

export type NodeIntervalJson = {
	intervalRef: IntervalReference;
	parentRef?: NodeReference;
	weights?: WeightData;
	// I could define an interval to maintain the relationship, but no event happens
	eventRef?: EventReference;
	edge?: WeightData;
};

export interface NodeJson {
	ref: NodeReference;
	type: NodeType;
	intervals: NodeIntervalJson[];
	tags?: string[];
}

export interface NodeSettings {
	tags?: string[];
}

export type NodeOperator = (
	targetWeights: Weights,
	sourceWeights: Weights,
) => void;

export const NODE_DEFAULT_TYPE = '__DEFAULT__';

export interface NodePullSettings {
	continue?: (node: NodeInterface) => boolean;
}
