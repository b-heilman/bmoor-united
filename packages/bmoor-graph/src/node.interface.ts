import {Weights} from './weights'
import {WeightedInterface} from './weighted.interface';
import { EventOrder } from './event.interface';

export interface NodeJSON extends WeightedInterface {
	ref: string;
	type: string;
}

export interface NodeInterface extends NodeJSON {
}

export type NodeOperator = (
	targetWeights: Weights,
	sourceWeights: Weights
) => void;

export type NodeReference = string;

export type NodeType = string;

export const NODE_DEFAULT_TYPE = '__DEFAULT__';