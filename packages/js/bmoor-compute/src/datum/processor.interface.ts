import {FeatureReference, FeatureValue} from '../datum.interface';
import {DatumAccessorInterface} from './accessor.interface';

export interface DatumProcessorSelect<NodeSelector, IntervalRef> {
	input?:
		| DatumProcessorInterface<NodeSelector, IntervalRef>
		| DatumAccessorInterface<NodeSelector, IntervalRef>;
	offset?: number; // how far back to look
	strict?: boolean; // if the node is missing, fail?
}

export interface DatumProcessorSelectAcross<NodeSelector, IntervalRef>
	extends DatumProcessorSelect<NodeSelector, IntervalRef> {
	select?: NodeSelector;
	reduce?: boolean;
}

export interface DatumProcessorSelectRange<NodeSelector, IntervalRef>
	extends DatumProcessorSelect<NodeSelector, IntervalRef> {
	range: number;
	strict?: boolean;
}

export type DatumProcessorRequirement<NodeSelector, IntervalRef> =
	| DatumProcessorSelect<NodeSelector, IntervalRef>
	| DatumProcessorSelectAcross<NodeSelector, IntervalRef>
	| DatumProcessorSelectRange<NodeSelector, IntervalRef>;

// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
// https://www.rst.software/blog/advanced-typing-in-typescript-with-generics

export type DatumProcessorFunction<ResponseIndex> = (
	args: ResponseIndex,
) => FeatureValue;

export type DatumProcessorResponse = FeatureValue;

export interface DatumProcessorInterface<
	NodeSelector,
	IntervalRef,
	ResponseIndex = Record<string, unknown>,
> {
	name: FeatureReference;  

	getRequirements(): {
		[Property in keyof ResponseIndex]: DatumProcessorRequirement<
			NodeSelector,
			IntervalRef
		>;
	};

	process(ResponseIndex): DatumProcessorResponse;
}
