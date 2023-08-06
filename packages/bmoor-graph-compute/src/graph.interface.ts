import {EnvironmentInterface} from '@bmoor/compute';
import {
	Graph,
	GraphBuilder,
	GraphJSON,
	GraphSelector,
	NodeSelector,
} from '@bmoor/graph';
import {OrderedMap} from '@bmoor/index';

import {
	IntervalInterface,
	IntervalJSON,
	IntervalOrder,
	IntervalReference,
} from './interval.interface';

/**
 * I am going to use this to manage the multiple graphs across time.  I believe
 * I want to also have an index which tracks all the nodes across time as well.
 * ----
 * The interface to compute will sit on top of this class.  I should be able to support
 * much of the functionality Graph used to.
 */
export interface DimensionalGraphJSON {
	intervals: IntervalJSON[];
	graphs: Record<IntervalReference, GraphJSON>;
}

export interface DimensionalGraphInterface
	extends EnvironmentInterface<
		GraphSelector,
		NodeSelector,
		IntervalReference,
		IntervalOrder
	> {
	graphs: OrderedMap<IntervalReference, Graph>;

	getGraph(interval: IntervalInterface): Graph;
}

// TODO: where do I convert from string to internal selector?
// selector examples as string
// 12/05/21:eagles > qb:current:pass-yards -> yards for that game
// 12/05/21:eagles > qb:past:pass-yards -> yards for the season for qb
// 12/05/21:eagles:past:pass-yards -> yards for the season for team
// DimensionalGraphSelectorMode

export {NodeValueSelector} from '@bmoor/graph/src/node.interface';

export interface DimensionalGraphBuilderPage extends GraphBuilder {
	interval: IntervalInterface;
}

export type DimensionalGraphBuilder = Map<
	IntervalReference,
	DimensionalGraphBuilderPage
>;
