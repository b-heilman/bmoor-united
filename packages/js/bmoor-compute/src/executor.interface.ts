import {DatumAccessor} from './datum/accessor';
import {DatumAccessorResponse} from './datum/accessor.interface';
import {DatumProcessor} from './datum/processor';
import {DatumProcessorResponse} from './datum/processor.interface';

export type ExecutorAction<NodeSelector, IntervalRef> =
	| DatumAccessor<NodeSelector, IntervalRef>
	| DatumProcessor<NodeSelector, IntervalRef>;

export type ExecutorResponse =
	| DatumAccessorResponse
	| DatumProcessorResponse;
