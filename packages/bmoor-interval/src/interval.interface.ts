export type IntervalOrder = number;

export type IntervalReference = string;

export type IntervalLabel = string;

export interface IntervalInterface {
	ref: IntervalReference;
	label: IntervalLabel;
	order: IntervalOrder;
}

// because there's no difference
export type IntervalJson = IntervalInterface;
