import {Tags} from '@bmoor/tagging';

export type IntervalReference = number;

export interface IntervalInterface {
	ref: IntervalReference;
	label: string;
	tags: Tags;
}

// because there's no difference
export type IntervalJSON = IntervalInterface;
