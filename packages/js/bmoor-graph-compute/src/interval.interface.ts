import {IntervalInterface as SuperInterface} from '@bmoor/compute';

export type IntervalReference = string;

export type IntervalOrder = number;

export type IntervalLabel = string;

export interface IntervalInterface
	extends SuperInterface<IntervalReference, IntervalOrder> {
	label: IntervalLabel;
	toJSON(): object;
}

// because there's no difference
export interface IntervalJSON
	extends SuperInterface<IntervalReference, IntervalOrder> {
	label: IntervalLabel;
}
