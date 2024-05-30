import {GraphDatumInterface} from '@bmoor/graph';

import {GraphComputeSectionInterface} from './graph/section.interface';

export interface GraphComputeDatumInterface<SelectorT>
	extends GraphDatumInterface<SelectorT> {
	graph: GraphComputeSectionInterface<SelectorT>;
}
