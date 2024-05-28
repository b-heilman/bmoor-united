import {
	ActionRange,
	ActionRequire,
	ActionSelect,
	Registry,
} from '@bmoor/compute';
import {GraphCompute, GraphComputeSelector} from '@bmoor/interval';

import {Selector, SelectorOverride} from './index.interface';

export const graph: GraphCompute = new GraphCompute();
export const registry: Registry<Selector, SelectorOverride> = new Registry(
	graph,
);
