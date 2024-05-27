import { Graph, GraphDatum, GraphSelector, Node } from "@bmoor/graph";
import { Interval } from "../interval";
import { GraphComputeSectionInterface } from "./section.interface";
import { GraphComputeDatum } from "../datum";
import { GraphComputeInterface, GraphComputeSelector } from "../graph.interface";

export class GraphComputeSection<
    SelectorT extends GraphComputeSelector
> extends Graph 
    implements GraphComputeSectionInterface<SelectorT>{
    interval: Interval
    parent: GraphComputeInterface<
        GraphComputeDatum<SelectorT>,
        SelectorT
    >

    setInterval(interval: Interval, parent: GraphComputeInterface<GraphComputeDatum<SelectorT>,SelectorT>){
        this.interval = interval;
        this.parent = parent;
    }

    createDatum(node: Node): GraphComputeDatum<SelectorT> {
        return new GraphComputeDatum<SelectorT>(node, this, this.parent);
    }

    select(
        datum: GraphComputeDatum<SelectorT>,
        selector: SelectorT
    ): GraphComputeDatum<SelectorT>[] {
        if (selector.across || selector.interval) {
            return this.parent.select(datum, selector);
        } else {
            return super.select(datum, selector);
        }
    }
}