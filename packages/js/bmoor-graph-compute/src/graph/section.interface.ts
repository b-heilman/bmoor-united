import {GraphInterface} from '@bmoor/graph';

import {GraphComputeDatumInterface} from '../datum.interface.ts';
import {IntervalInterface} from '../interval.interface.ts';

export interface GraphComputeSectionInterface<SelectorT>
	extends GraphInterface<
		GraphComputeDatumInterface<SelectorT>,
		SelectorT
	> {
	interval: IntervalInterface;
}
