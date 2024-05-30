import {GraphInterface} from '@bmoor/graph';

import {GraphComputeDatumInterface} from '../datum.interface';
import {IntervalInterface} from '../interval.interface';

export interface GraphComputeSectionInterface<SelectorT>
	extends GraphInterface<
		GraphComputeDatumInterface<SelectorT>,
		SelectorT
	> {
	interval: IntervalInterface;
}
