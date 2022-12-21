import {pearsonCorrelation} from '@bmoor/stats';

import {Weights} from '../weighted.interface';
import {Event} from '../event';
import {Edge} from '../edge';
import {Node} from '../node';
import { Graph } from "../graph";

export class Frame {
    graph: Graph;
    columns: string[];
    computed: number[][];

    constructor(graph: Graph){
        this.graph = graph;
        this.columns = null;
        this.computed = [];
    }

    compute(
		compute: (
			nodeA: Node,
			nodeB: Node,
			edgeA: Edge,
			edgeB: Edge
		) => Weights,
		settings: {
			labeler?: (edgeA: Edge, edgeB:Edge) => Weights;
            // TODO: Node.type
		} = {}
	) {
        this.columns = null;

		this.computed = Object.values(this.graph.events).flatMap((events) => {
			return Array.from(events).flatMap(([key, event]) => {
                // TODO: not sure I want to return back an object or an array
				const weights: Weights[] = event.computeDataFrame(compute, settings);

                return weights.map(weight => {
                    if (!this.columns){
                        this.columns = Object.keys(weight);
                    }

                    const rtn = [];

                    this.columns.forEach(key => {
                        rtn.push(weight[key]);
                    });

                    return rtn;
                });
            });
		});
	}

    checkCorrelation(col1: string, col2: string){
        const pos1 = this.columns.indexOf(col1);
        const pos2 = this.columns.indexOf(col2);
        
        return pearsonCorrelation(
            this.computed.map(row => row[pos1]), 
            this.computed.map(row => row[pos2])
        );
    }

    getColumnCombinations(columns: string[] = null){
        if (columns){
            // eh?, sanitize?
        } else {
            columns = this.columns.slice(0);
        }

        const rtn = [];
        while(columns.length){
            const left = columns.shift();

            for (let right of columns){
                rtn.push([left, right]);
            }
        }

        return rtn;
    }

    toJSON(){
        return {
            columns: this.columns,
            values: this.computed
        }
    }
}