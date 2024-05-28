import { Graph, GraphDatum, GraphSelector, Node } from "@bmoor/graph";
import { Interval } from "../interval";
import { GraphComputeSectionInterface } from "./section.interface";
import { GraphComputeInterface, GraphComputeSelector } from "../graph.interface";
import { GraphComputeDatumInterface } from "../datum.interface";

export class GraphComputeSection<
    DatumT extends GraphComputeDatumInterface<SelectorT>,
    SelectorT extends GraphComputeSelector
> extends Graph<DatumT, SelectorT> 
    implements GraphComputeSectionInterface<SelectorT>{
    interval: Interval
    parent: GraphComputeInterface<DatumT, SelectorT>

    setInterval(
        interval: Interval, 
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