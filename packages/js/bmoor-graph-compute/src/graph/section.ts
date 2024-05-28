import { Graph } from "@bmoor/graph";
import { GraphComputeSectionInterface } from "./section.interface";
import { GraphComputeInterface, GraphComputeSelector } from "../graph.interface";
import { GraphComputeDatumInterface } from "../datum.interface";
import { IntervalInterface } from "../interval.interface"; 

export class GraphComputeSection<
    DatumT extends GraphComputeDatumInterface<SelectorT>,
    SelectorT extends GraphComputeSelector
> extends Graph<DatumT, SelectorT> 
    implements GraphComputeSectionInterface<SelectorT>{
    interval: IntervalInterface
    parent: GraphComputeInterface<DatumT, SelectorT>

    setInterval(
        interval: IntervalInterface, 
        parent: GraphComputeInterface<DatumT,SelectorT>
    ){
        this.interval = interval;
        this.parent = parent;
    }

    select(
        datum: DatumT,
        selector: SelectorT
    ): DatumT[] {
        if (selector.across || selector.interval) {
            return this.parent.select(datum, selector);
        } else {
            return super.select(datum, selector);
        }
    }
}