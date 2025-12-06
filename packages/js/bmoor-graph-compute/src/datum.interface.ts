import {GraphDatumInterface} from '@bmoor/graph';

import type {GraphComputeSectionInterface} from './graph/section.interface.ts';

export interface GraphComputeDatumInterface<
	SelectorT,
> extends GraphDatumInterface<SelectorT> {
	graph: GraphComputeSectionInterface<SelectorT>;
}
