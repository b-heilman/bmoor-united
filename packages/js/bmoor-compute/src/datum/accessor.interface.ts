import {
	DatumAccessor,
	FeatureReference,
	FeatureValue,
} from '../datum.interface';
import {DatumProcessorInterface} from './processor.interface';

export type DatumAccessorRequest<NodeSelector, IntervalRef> = Record<
	FeatureReference,
	DatumProcessorInterface<NodeSelector, IntervalRef> | FeatureReference
>;
export type DatumAccessorResponse = Record<FeatureReference, FeatureValue>;

export interface DatumAccessorInterface<NodeSelector, IntervalRef> {
	getRequirements(): DatumProcessorInterface<NodeSelector, IntervalRef>[];

	read(datum: DatumAccessor): Promise<DatumAccessorResponse>;
}
