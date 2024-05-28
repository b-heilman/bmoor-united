import { GraphInterface } from "@bmoor/graph";

import { Interval } from "../interval";
import { GraphComputeDatumInterface } from "../datum.interface";

export interface GraphComputeSectionInterface<SelectorT>
    extends GraphInterface<GraphComputeDatumInterface<SelectorT>, SelectorT> {
        interval: Interval
}