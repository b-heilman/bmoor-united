import {IntervalInterface as SuperInterface} from '@bmoor/compute';

export type IntervalReference = string;

export type IntervalOrder = number;

export type IntervalLabel = string;

export interface IntervalInterface
	extends SuperInterface<IntervalReference, IntervalOrder> {
	label: IntervalLabel;
}

// because there's no difference
export type IntervalJSON = IntervalInterface;
