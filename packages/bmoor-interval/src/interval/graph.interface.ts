import {Graph} from '@bmoor/graph/src/graph';
import {GraphJson, GraphSelector} from '@bmoor/graph/src/graph.interface';
import {Node} from '@bmoor/graph/src/node';
import {NodeValueSelector} from '@bmoor/graph/src/node.interface';
import {OrderedMap} from '@bmoor/index';

import {IntervalJson, IntervalReference} from '../interval.interface';

/**
 * I am going to use this to manage the multiple graphs across time.  I believe
 * I want to also have an index which tracks all the nodes across time as well.
 * ----
 * The interface to compute will sit on top of this class.  I should be able to support
 * much of the functionality Graph used to.
 */
export interface IntervalGraphJson {
	intervals: IntervalJson[];
	graphs: Record<IntervalReference, GraphJson>;
}

export interface IntervalGraphInterface {
	graphs: OrderedMap<IntervalReference, Graph>;

	addNode(interval: IntervalReference, node: Node): Graph;

	getGraph(interval: IntervalReference): Graph;
}

// TODO: where do I convert from string to internal selector?
// selector examples as string
// 12/05/21:eagles > qb:current:pass-yards -> yards for that game
// 12/05/21:eagles > qb:past:pass-yards -> yards for the season for qb
// 12/05/21:eagles:past:pass-yards -> yards for the season for team
// IntervalGraphSelectorMode

export interface IntervalGraphSelector extends GraphSelector {
	mode?: NodeValueSelector; // current , past
}

export {NodeValueSelector as IntervalGraphSelectorMode} from '@bmoor/graph/src/node.interface';
