import {Executor} from '@bmoor/compute';

import { GraphComputeSelector } from './graph.interface';
import { GraphComputeDatumInterface } from './datum.interface';
import { GraphCompute } from './graph';

export class GraphExecutor extends Executor<
	GraphComputeDatumInterface<GraphComputeSelector>,
	GraphComputeSelector,
	GraphCompute
> {}
