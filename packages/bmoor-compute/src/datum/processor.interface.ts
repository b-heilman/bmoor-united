import {FeatureReference, FeatureValue} from '../datum.interface';
import {
	DatumAccessorInterface,
	DatumAccessorResponse,
} from './accessor.interface';

export interface DatumProcessorSelect<NodeSelector, IntervalRef> {
	input?:
		| DatumProcessorInterface<NodeSelector, IntervalRef>
		| DatumAccessorInterface<NodeSelector, IntervalRef>;
	offset?: number;
}

export interface DatumProcessorSelectAcross<NodeSelector, IntervalRef>
	extends DatumProcessorSelect<NodeSelector, IntervalRef> {
	select?: NodeSelector;
	reduce?: boolean;
}

export interface DatumProcessorSelectRange<NodeSelector, IntervalRef>
	extends DatumProcessorSelect<NodeSelector, IntervalRef> {
	range: number;
}

export type DatumProcessorRequirement<NodeSelector, IntervalRef> =
	| DatumProcessorSelect<NodeSelector, IntervalRef>
	| DatumProcessorSelectAcross<NodeSelector, IntervalRef>
	| DatumProcessorSelectRange<NodeSelector, IntervalRef>;

export type DatumProcessorRequirementsResponse =
	| DatumAccessorResponse
	| DatumAccessorResponse[]
	| DatumProcessorResponse
	| DatumProcessorResponse[];

export type DatumProcessorFunction = (
	...args: DatumProcessorRequirementsResponse[]
) => FeatureValue;

export type DatumProcessorResponse = FeatureValue;

export interface DatumProcessorInterface<NodeSelector, IntervalRef> {
	name: FeatureReference;

	getRequirements(): DatumProcessorRequirement<
		NodeSelector,
		IntervalRef
	>[];

	process(...DatumProcessorRequirementsResponse): DatumProcessorResponse;
}
