import {Executor} from '@bmoor/compute';

import {GraphComputeDatumInterface} from './datum.interface';
import {GraphCompute} from './graph';
import {GraphComputeSelector} from './graph.interface';

export class GraphExecutor extends Executor<
	GraphComputeDatumInterface<GraphComputeSelector>,
	GraphComputeSelector,
	GraphCompute
> {}
