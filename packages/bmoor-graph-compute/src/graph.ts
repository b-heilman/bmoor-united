import {DatumInterface, EnvironmentRangeSettings} from '@bmoor/compute';
import {
	Graph,
	GraphDatum,
	GraphSelector,
	NodeSelector,
	load as loadGraph,
} from '@bmoor/graph';
import {OrderedMap} from '@bmoor/index';

import {
	DimensionalGraphInterface,
	DimensionalGraphJSON,
} from './graph.interface';
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

		if (!this.hasInterval(interval.ref)) {
			this.addInterval(interval);
		}
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
	): DatumInterface<NodeSelector>[] {
		return this.graphs.get(interval.ref).select(selector);
	}

	intervalSelect(datum: GraphDatum, interval: Interval): GraphDatum {
		const cur = this.graphs.get(interval.ref);
		const node = cur.getNode(datum.node.ref);

		if (!node) {
			throw new Error(
				'could not interval select ' +
					datum.node.ref +
					' in interval ' +
					interval.ref,
			);
		}

		return new GraphDatum(node, cur);
	}

	rangeSelect(
		datum: GraphDatum,
		interval: Interval,
		range: number,
		settings?: EnvironmentRangeSettings,
	): Map<Interval, GraphDatum> {
		if (!settings) {
			settings = {};
		}

		const strict = 'strict' in settings ? settings.strict : true;
		const keep = settings.keep || range;
		const end = this.graphs.getTagOffset(interval.ref, 1 - range, true);
		const graphs = this.graphs.getBetween(interval.ref, end);

		const rtn = new Map();

		for (const [intervalRef, graph] of graphs.entries()) {
			if (rtn.size === keep) {
				continue;
			}

			const node = graph.getNode(datum.node.ref);

			if (node) {
				rtn.set(
					this.getInterval(intervalRef),
					new GraphDatum(graph.getNode(datum.node.ref), graph),
				);
			} else if (strict) {
				throw new Error(
					`could not range select ${datum.node.ref} in interval ${intervalRef}`,
				);
			}
		}

		return rtn;
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
		graph.addInterval(new Interval(input.ref, input.order, input.label));
	}

	for (const intervalRef in schema.graphs) {
		const graphInput = schema.graphs[intervalRef];

		graph.addGraph(graph.getInterval(intervalRef), loadGraph(graphInput));
	}

	return graph;
}
