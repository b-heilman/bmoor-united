import { GraphInterface } from "@bmoor/graph";

import { Interval } from "../interval";

export interface GraphComputeSectionInterface<SelectorT>
    extends GraphInterface<SelectorT> {
        interval: Interval
}