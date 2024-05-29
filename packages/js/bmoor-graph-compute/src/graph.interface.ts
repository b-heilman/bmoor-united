import {
	DatumOffsetContext, 
	DatumAcrossContext,
	DatumInterface,
	DatumRangeContext,
	EnvironmentInterface
} from '@bmoor/compute';
import {
	GraphBuilder,
	GraphJSON,
	GraphSelector,
} from '@bmoor/graph';

import {
	IntervalInterface,
	IntervalJSON,
	IntervalReference,
} from './interval.interface';
import { GraphComputeSectionInterface } from './graph/section.interface';

/**
 * I am going to use this to manage the multiple graphs across time.  I believe
 * I want to also have an index which tracks all the nodes across time as well.
 * ----
 * The interface to compute will sit on top of this class.  I should be able to support
 * much of the functionality Graph used to.
 */
export interface GraphComputeJSON {
	intervals: IntervalJSON[];
	sections: Record<IntervalReference, GraphJSON>;
}

export interface GraphComputeSelector extends GraphSelector {
	across?: boolean;
	interval?: IntervalReference | IntervalInterface;
}

export interface GraphComputeInterface<
	DatumT extends DatumInterface<SelectorT>, 
	SelectorT extends GraphComputeSelector
> extends EnvironmentInterface<DatumT, SelectorT>, 
		DatumOffsetContext<DatumT, SelectorT>,  
		DatumAcrossContext<DatumT, SelectorT>,
		DatumRangeContext<DatumT, SelectorT>{
	hasInterval(intervalRef: IntervalReference): boolean;
	addInterval(interval: IntervalInterface): void;
	getInterval(intervalRef: IntervalReference): IntervalInterface;
	hasSection(interval: IntervalInterface): boolean;
	addSection(section: GraphComputeSectionInterface<SelectorT>): void;
	getSection(interval: IntervalInterface): GraphComputeSectionInterface<SelectorT>;
}



// TODO: where do I convert from string to internal selector?
// selector examples as string
// 12/05/21:eagles > qb:current:pass-yards -> yards for that game
// 12/05/21:eagles > qb:past:pass-yards -> yards for the season for qb
// 12/05/21:eagles:past:pass-yards -> yards for the season for team
// GraphComputeSelectorMode

export {NodeValueSelector} from '@bmoor/graph/src/node.interface';

export interface GraphComputeBuilderPage extends GraphBuilder {
	interval: IntervalInterface;
}

export type GraphComputeBuilder = Map<
	IntervalReference,
	GraphComputeBuilderPage
>;
