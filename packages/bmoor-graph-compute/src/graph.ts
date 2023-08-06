import {
	Graph,
	GraphDatum,
	GraphGlobal,
	GraphSelector,
	load as loadGraph,
} from '@bmoor/graph';
import {OrderedMap} from '@bmoor/index';

import {
	DimensionalGraphInterface,
	DimensionalGraphJSON,
} from './graph.interface';
import {DimensionalGraphSelection} from './graph/selection';
import {Interval} from './interval';
import {IntervalReference} from './interval.interface';

export class DimensionalGraph implements DimensionalGraphInterface {
	graphs: OrderedMap<IntervalReference, Graph>;
	intervals: Map<IntervalReference, Interval>;

	constructor() {
		this.graphs = new OrderedMap<IntervalReference, Graph>();
		this.intervals = new Map<IntervalReference, Interval>();
	}

	hasInterval(intervalRef: IntervalReference) {
		return this.intervals.has(intervalRef);
	}

	addInterval(interval: Interval) {
		this.intervals.set(interval.ref, interval);
	}

	getInterval(intervalRef: IntervalReference) {
		const rtn = this.intervals.get(intervalRef);

		if (!rtn) {
			throw new Error('unknown interval: ' + intervalRef);
		}

		return rtn;
	}

	addGraph(interval: Interval, graph: Graph) {
		this.graphs.set(interval.ref, graph);
	}

	getGraph(interval: Interval) {
		let graph = this.graphs.get(interval.ref);

		if (!graph) {
			graph = new Graph();

			this.addGraph(interval, graph);
		}

		return graph;
	}

	getGraphSeries(start: Interval, stop: Interval): Graph[] {
		return Array.from(
			this.graphs.getBetween(start.ref, stop.ref).values(),
		);
	}

	// TODO: do I want to cache selectors?
	// The below operations are accessed with intervalReference.  I don't love it, I'd like it to all be
	// Interval, but I don't want to keep messing around.
	select(
		interval: Interval,
		selector: GraphSelector,
	): DimensionalGraphSelection {
		return new DimensionalGraphSelection(
			this.graphs.get(interval.ref).select(selector),
			interval,
		);
	}

	getGlobal(interval: Interval): GraphGlobal {
		return this.graphs.get(interval.ref).getGlobal();
	}

	intervalSelect(datum: GraphDatum, interval: Interval): GraphDatum {
		return new GraphDatum(
			this.graphs.get(interval.ref).getNode(datum.node.ref),
			datum.mode,
		);
	}

	rangeSelect(
		datum: GraphDatum,
		interval: Interval,
		range: number,
	): Map<Interval, GraphDatum> {
		const begin = this.graphs.getTagOffset(interval.ref, 1 - range, true);

		const graphs = this.graphs.getBetween(begin, interval.ref);

		const rtn = new Map();

		for (const [intervalRef, graph] of graphs.entries()) {
			rtn.set(
				this.getInterval(intervalRef),
				new GraphDatum(graph.getNode(datum.node.ref), datum.mode),
			);
		}

		return rtn;
	}

	overrideSelector(
		select: GraphSelector,
		override: GraphSelector,
	): GraphSelector {
		return Object.assign(select, override);
	}

	offsetInterval(interval: Interval, offset: number): Interval {
		return this.getInterval(
			this.graphs.getTagOffset(interval.ref, offset),
		);
	}

	toJSON(): DimensionalGraphJSON {
		const intervals = [];
		const graphs = {};

		for (const intervalRef of this.graphs.tags) {
			const interval = this.intervals.get(intervalRef);
			const graph = this.graphs.get(intervalRef);

			intervals.push(interval.toJSON());
			graphs[intervalRef] = graph.toJSON();
		}

		return {
			intervals,
			graphs,
		};
	}
}

export function dump(graph: DimensionalGraph): DimensionalGraphJSON {
	return graph.toJSON();
}

export function load(schema: DimensionalGraphJSON): DimensionalGraph {
	const graph = new DimensionalGraph();

	for (const input of schema.intervals) {
		graph.addInterval(new Interval(input.ref, input.label, input.order));
	}

	for (const intervalRef in schema.graphs) {
		const graphInput = schema.graphs[intervalRef];

		graph.addGraph(graph.getInterval(intervalRef), loadGraph(graphInput));
	}

	return graph;
}
