import {Weights} from './weights';
import {Interval} from './interval.interface';
import {WeightData} from './weights.interface';

export type NodeReference = string;

export type NodeType = string;

export type NodeTag = string;

type IntervaledWeights = {
	interval: number;
	data: WeightData;
};

export interface NodeJson {
	ref: NodeReference;
	type: NodeType;
	weights: IntervaledWeights[];
	parentRef: NodeReference;
}

export interface NodeInterface {
	ref: NodeReference;
	type: NodeType;
	tag?: string;
	parent?: NodeInterface;
	intervals: Map<Interval, Weights>;
	children: NodeInterface[];
}

export interface NodeSettings {
	parent?: NodeInterface;
	tag?: string;
}

export type NodeOperator = (
	targetWeights: Weights,
	sourceWeights: Weights
) => void;

export const NODE_DEFAULT_TYPE = '__DEFAULT__';
