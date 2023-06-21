import {EnvironmentInterface} from '@bmoor/compute/src/environment.interface';
import {Graph, load as loadGraph} from '@bmoor/graph/src/graph';
import {Node} from '@bmoor/graph/src/node';
import {OrderedMap} from '@bmoor/index';

import {Interval} from '../interval';
import {IntervalReference} from '../interval.interface';
import {
	IntervalGraphInterface,
	IntervalGraphJson,
	IntervalGraphSelector,
} from './graph.interface';
import {IntervalGraphDatum} from './graph/datum';
import {IntervalGraphGlobal} from './graph/global';

export class IntervalGraph
	implements
		IntervalGraphInterface,
		EnvironmentInterface<IntervalReference, IntervalGraphSelector>
{
	graphs: OrderedMap<IntervalReference, Graph>;
	intervals: Map<IntervalReference, Interval>;

	constructor() {
		this.graphs = new OrderedMap<IntervalReference, Graph>();
		this.intervals = new Map<IntervalReference, Interval>();
	}

	addInterval(interval: Interval) {
		this.intervals.set(interval.ref, interval);
	}

	addNode(intervalRef: IntervalReference, node: Node): Graph {
		let graph = this.graphs.getNode(intervalRef);

		if (!graph) {
			graph = new Graph();

			this.addGraph(intervalRef, graph);
		}

		graph.addNode(node);

		return graph;
	}

	addGraph(intervalRef: IntervalReference, graph: Graph) {
		this.graphs.setNode(intervalRef, graph);
	}

	getGraph(intervalRef: IntervalReference) {
		return this.graphs.getNode(intervalRef);
	}

	getGraphSeries(
		start: IntervalReference,
		stop: IntervalReference,
	): Graph[] {
		return Array.from(this.graphs.getNodesBetween(start, stop).values());
	}

	// TODO: do I want to cache selectors?
	select(
		interval: IntervalReference,
		selector: IntervalGraphSelector,
	): IntervalGraphDatum[] {
		const selection = this.graphs.getNode(interval).select(selector);

		return selection.map(
			(node: Node) =>
				new IntervalGraphDatum(interval, node, selector.mode),
		);
	}

	subSelect(
		datum: IntervalGraphDatum,
		interval: IntervalReference,
		selector: IntervalGraphSelector,
	): IntervalGraphDatum[] {
		const selection = this.graphs
			.getNode(interval)
			.subSelect(datum.node, selector);

		return selection.map(
			(node: Node) =>
				new IntervalGraphDatum(interval, node, selector.mode),
		);
	}

	getGlobal(interval: string): IntervalGraphGlobal {
		return new IntervalGraphGlobal(
			interval,
			this.graphs.getNode(interval),
		);
	}

	intervalSelect(
		datum: IntervalGraphDatum,
		interval: IntervalReference,
	): IntervalGraphDatum {
		return new IntervalGraphDatum(
			interval,
			this.graphs.getNode(interval).select(this.getSelfSelector(datum))[0],
			datum.mode,
		);
	}

	rangeSelect(
		datum: IntervalGraphDatum,
		interval: IntervalReference,
		range: number,
	): IntervalGraphDatum[] {
		const begin = this.graphs.getTagOffset(interval, 1 - range, true);

		const graphs = this.graphs.getNodesBetween(begin, interval);

		const rtn = [];

		for (const [interval, graph] of graphs.entries()) {
			rtn.push(
				new IntervalGraphDatum(
					interval,
					graph.select(this.getSelfSelector(datum))[0],
					datum.mode,
				),
			);
		}

		return rtn;
	}

	getSelfSelector(datum: IntervalGraphDatum): IntervalGraphSelector {
		return {
			reference: datum.node.ref,
		};
	}

	overrideSelector(
		select: IntervalGraphSelector,
		override: IntervalGraphSelector,
	): IntervalGraphSelector {
		return Object.assign(select, override);
	}

	offsetInterval(
		interval: IntervalReference,
		offset: number,
	): IntervalReference {
		return this.graphs.getTagOffset(interval, offset);
	}

	/*
	TODO: toDateFrame
	computeDataFrame(
		compute: (
			nodeA: NodeInterface,
			nodeB: NodeInterface,
			edgeA: Edge,
			edgeB: Edge
		) => Weights,
		settings: {
			labeler?: (edgeA: Edge, edgeB: Edge) => Weights;
		} = {}
	): Weights[] {
		// TODO: make this do proper permutations?
		const edges = this.nodes.values();
		const edgeA = edges.next().value;
		const edgeB = edges.next().value;

		const sets = [
			{
				from: edgeA,
				to: edgeB
			},
			{
				from: edgeB,
				to: edgeA
			}
		];

		return sets.map(({from, to}) => {
			const weights = compute(from.from, to.from, from, to);

			if (settings.labeler) {
				Object.assign(weights, settings.labeler(from, to));
			}

			return weights;
		});
	}
	*/

	toJSON(): IntervalGraphJson {
		const intervals = [];
		const graphs = {};

		for (const intervalRef of this.graphs.tags) {
			const interval = this.intervals.get(intervalRef);
			const graph = this.graphs.getNode(intervalRef);

			intervals.push(interval.toJSON());
			graphs[intervalRef] = graph.toJSON();
		}

		return {
			intervals,
			graphs,
		};
	}
}

export function dump(graph: IntervalGraph): IntervalGraphJson {
	return graph.toJSON();
}

export function load(schema: IntervalGraphJson): IntervalGraph {
	const graph = new IntervalGraph();

	for (const input of schema.intervals) {
		graph.addInterval(new Interval(input.ref, input.label, input.order));
	}

	for (const intervalRef in schema.graphs) {
		const graphInput = schema.graphs[intervalRef];

		graph.addGraph(intervalRef, loadGraph(graphInput));
	}

	return graph;
}
