import {Executor} from '@bmoor/compute';

import {GraphComputeDatumInterface} from './datum.interface.ts';
import {GraphComputeSelector} from './graph.interface.ts';
import {GraphCompute} from './graph.ts';

export class GraphExecutor extends Executor<
	GraphComputeDatumInterface<GraphComputeSelector>,
	GraphComputeSelector,
	GraphCompute
> {}
