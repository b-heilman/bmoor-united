import {
	ActionRange,
	ActionRequire,
	ActionSelect,
	Registry,
} from '@bmoor/compute';
import {IntervalGraph, IntervalGraphSelector} from '@bmoor/interval';

import {Selector, SelectorOverride} from './index.interface';

export const graph: IntervalGraph = new IntervalGraph();
export const registry: Registry<Selector, SelectorOverride> = new Registry(
	graph,
);
