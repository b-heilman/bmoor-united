import {GraphInterface} from '@bmoor/graph';

import type {GraphComputeDatumInterface} from '../datum.interface.ts';
import type {IntervalInterface} from '../interval.interface.ts';

export interface GraphComputeSectionInterface<
	SelectorT,
> extends GraphInterface<
	GraphComputeDatumInterface<SelectorT>,
	SelectorT
> {
	interval: IntervalInterface;
}
