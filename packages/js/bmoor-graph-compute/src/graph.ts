import {ComputeUnknownInterval} from '@bmoor/compute';
import {Context} from '@bmoor/context';
import {
	Graph,
	GraphDatum,
	GraphSelector,
	load as loadGraph,
} from '@bmoor/graph';
import {OrderedMap} from '@bmoor/index';

import {
	GraphComputeInterface,
	GraphComputeJSON,
	GraphComputeSelector,
} from './graph.interface';
import {Interval} from './interval';
import {IntervalReference} from './interval.interface';
import { GraphComputeSection } from './graph/section';
import { GraphComputeDatum } from './datum';
import { GraphComputerDatumInterface } from './datum.interface';

export class GraphCompute implements 
	GraphComputeInterface<
		GraphComputerDatumInterface<GraphComputeSelector>,
		GraphComputeSelector
	> {
	sections: OrderedMap<IntervalReference, GraphComputeSection<GraphComputeSelector>>;
	intervals: Map<IntervalReference, Interval>;

	constructor() {
		this.sections = new OrderedMap<IntervalReference, GraphComputeSection<GraphComputeSelector>>();
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
			throw new ComputeUnknownInterval('unknown interval: ' + intervalRef);
		}

		return rtn;
	}

	hasSection(interval: Interval){
		return this.sections.has(interval.ref);
	}

	addSection(graph: GraphComputeSection<GraphComputeSelector>) {
		this.sections.set(graph.interval.ref, graph);

		if (!this.hasInterval(graph.interval.ref)) {
			this.addInterval(graph.interval);
		}
	}

	getSection(interval: Interval) {
		let section = this.sections.get(interval.ref);

		if (!section) {
			section = new GraphComputeSection<GraphComputeSelector>();

			section.setInterval(interval);

			this.addSection(section);
		}

		return section;
	}

	//getGraphSeries(start: Interval, stop: Interval): Graph[] {
	//	return Array.from(
	//		this.sections.getBetween(start.ref, stop.ref).values(),
	//	);
	//}

	select(
		base: GraphComputeDatum<GraphComputeSelector>,
		selector: GraphComputeSelector
	): GraphComputerDatumInterface<GraphComputeSelector>[] {
		if (selector.across){
			return Object.values(this.sections).flatMap(
				(section) => section.select(selector) 
			);
		} else if (selector.interval) {
			const interval = this.getInterval(selector.interval);

			return this.getSection(interval).select(selector);
		} else {
			return base.select(selector);
		}
	}

	range(
		base: GraphComputerDatumInterface<GraphComputeSelector>,
		range: number,
		strict = false
	): GraphComputerDatumInterface<GraphComputeSelector>[] {
		const interval = base.graph.interval;
		const offset = interval.ref;
		const rtn = [];
		const begin = this.sections.getTagOffset(offset, 1 - range, true);

		for (const [intervalRef, section] of this.sections
			.getBetween(begin, offset)
			.entries()) {
			const res = section.references.get(base.getReference());

			if (!res && strict) {
				throw new Error(
					`not able to range (${base.getReference()}, ${base.graph.interval.ref}, ${intervalRef})`,
				);
			} else {
				rtn.push(res);
			}
		}

		return rtn;
	}

	offset(
		base: GraphComputerDatumInterface<GraphComputeSelector>,
		offset: number,
		strict = false
	): GraphComputerDatumInterface<GraphComputeSelector> {
		const newIntervalRef = this.sections.getTagOffset(
			base.graph.interval.ref,
			-offset,
		);
		// console.log('Env:offset =>', datum.ref, datum.interval.ref, offset, newIntervalRef);

		const rtn = this.sections.get(newIntervalRef).references.get(base.getReference());

		if (!rtn && strict) {
			throw new Error(
				`not able to offset (${base.getReference()}, ${base.graph.interval.ref}, ${offset}, ${newIntervalRef})`,
			);
		} else {
			return rtn;
		}
	}
	/*
	intervalSelect(
		datum: GraphDatum,
		interval: Interval,
		strict = false,
	): GraphDatum {
		let graph = this.sections.get(interval.ref);
		let node = graph.getNode(datum.node.ref);

		if (strict && !node) {
			throw new Error(
				'strict: could not interval select ' +
					datum.node.ref +
					' in interval ' +
					interval.ref,
			);
		} else {
			let cur = this.sections.getPrevTag(interval.ref);
			while (cur && !node) {
				graph = this.sections.get(cur);
				node = graph.getNode(datum.node.ref);

				cur = this.sections.getPrevTag(cur);
			}

			if (!node) {
				throw new Error(
					'relaxed: could not interval select ' +
						datum.node.ref +
						' in interval ' +
						interval.ref,
				);
			}
		}

		return new GraphDatum(node, graph);
	}
	*/
	

	getPrevInterval(interval: Interval): Interval {
		return this.getInterval(this.sections.getPrevTag(interval.ref));
	}

	toJSON(): GraphComputeJSON {
		const intervals = [];
		const sections = {};

		for (const intervalRef of this.sections.tags) {
			const interval = this.intervals.get(intervalRef);
			const graph = this.sections.get(intervalRef);

			intervals.push(interval.toJSON());
			sections[intervalRef] = graph.toJSON();
		}

		return {
			intervals,
			sections,
		};
	}
}

export function dump(graph: DimensionalGraph): DimensionalGraphJSON {
	return graph.toJSON();
}

export function load(
	ctx: Context,
	schema: DimensionalGraphJSON,
): DimensionalGraph {
	const graph = new DimensionalGraph();

	const intervals = [];
	for (const input of schema.intervals) {
		intervals.push(new Interval(input.ref, input.order, input.label));
	}

	intervals
		.sort((a: Interval, b: Interval) => a.order - b.order)
		.forEach((interval) => {
			graph.addInterval(interval);
		});

	// TODO: I need to do this where I can sort the intervals after insertion easier, so insert
	//   order doesn't matter.  This works for now, but isn't sound logically.
	for (const interval of intervals) {
		const graphInput = schema.sections[interval.ref];
		const section: GraphComputeSection<GraphComputeSelector> = loadGraph(
			ctx, 
			graphInput, 
			(root) => new GraphComputeSection<GraphComputeSelector>(root)
		);

		section.interval = graph.getInterval(interval.ref);

		graph.addSection(section);
	}

	return graph;
}
