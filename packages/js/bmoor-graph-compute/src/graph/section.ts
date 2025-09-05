import {Graph} from '@bmoor/graph';

import {GraphComputeDatumInterface} from '../datum.interface.ts';
import {
	GraphComputeInterface,
	GraphComputeSelector,
} from '../graph.interface.ts';
import {IntervalInterface} from '../interval.interface.ts';
import {GraphComputeSectionInterface} from './section.interface.ts';

export class GraphComputeSection<
		DatumT extends GraphComputeDatumInterface<SelectorT>,
		SelectorT extends GraphComputeSelector,
	>
	extends Graph<DatumT, SelectorT>
	implements GraphComputeSectionInterface<SelectorT>
{
	interval: IntervalInterface;
	parent: GraphComputeInterface<DatumT, SelectorT>;

	setInterval(
		interval: IntervalInterface,
		parent: GraphComputeInterface<DatumT, SelectorT>,
	) {
		this.interval = interval;
		this.parent = parent;
	}

	select(datum: DatumT, selector: SelectorT): DatumT[] {
		if (selector.across || selector.interval) {
			return this.parent.select(datum, selector);
		} else {
			return super.select(datum, selector);
		}
	}
}
