import {Executor} from '@bmoor/compute';

import type {GraphComputeDatumInterface} from './datum.interface.ts';
import type {GraphComputeSelector} from './graph.interface.ts';
import {GraphCompute} from './graph.ts';

export class GraphExecutor extends Executor<
	GraphComputeDatumInterface<GraphComputeSelector>,
	GraphComputeSelector,
	GraphCompute
> {}
