import {Executor} from '@bmoor/compute';
import {GraphSelector, NodeSelector} from '@bmoor/graph';

import {IntervalOrder, IntervalReference} from './interval.interface';

export class DimensionalExecutor extends Executor<
	GraphSelector,
	NodeSelector,
	IntervalReference,
	IntervalOrder
> {}
