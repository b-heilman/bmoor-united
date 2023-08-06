import {
	ActionRange,
	ActionRequire,
	ActionSelect,
	Registry,
} from '@bmoor/compute';
import {DimensionalGraph, DimensionalGraphSelector} from '@bmoor/interval';

import {Selector, SelectorOverride} from './index.interface';

export const graph: DimensionalGraph = new DimensionalGraph();
export const registry: Registry<Selector, SelectorOverride> = new Registry(
	graph,
);
