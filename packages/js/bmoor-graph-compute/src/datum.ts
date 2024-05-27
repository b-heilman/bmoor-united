import { GraphDatum, GraphInterface, GraphSelector, Node } from "@bmoor/graph";
import { DatumInterface } from "@bmoor/compute";

import { GraphComputeSection } from "./graph/section";
import { GraphComputerDatumInterface } from "./datum.interface";
import { GraphComputeInterface } from "./graph.interface";


export class GraphComputeDatum<SelectorT extends GraphSelector> 
    extends GraphDatum<SelectorT> implements GraphComputerDatumInterface<SelectorT>{
    
    graph: GraphComputeSection<SelectorT>;
    global: GraphComputeInterface<GraphComputeDatum<SelectorT>, SelectorT>;

    constructor(
        node: Node, 
        graph: GraphComputeSection<SelectorT>,
        global: GraphComputeInterface<GraphComputeDatum<GraphSelector>, GraphSelector>
    ) {
        super(node, graph);

        this.global = global;
	}

    equals(other: DatumInterface<GraphSelector>){
        if (other instanceof(GraphComputeDatum)){
            return other.global === this.global && super.equals(other);
        } else {
            return false;
        }
    }
}