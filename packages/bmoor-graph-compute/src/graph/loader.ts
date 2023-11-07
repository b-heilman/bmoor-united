import {
	GraphLoader,
	GraphLoaderRow,
	GraphLoaderValue,
	applyBuilder,
} from '@bmoor/graph';

import {DimensionalGraph} from '../graph';
import {
	DimensionalGraphBuilder,
	DimensionalGraphBuilderPage,
} from '../graph.interface';
import {Interval} from '../interval';
import {DimensionalGraphLoaderSettings} from './loader.interface';

export class DimensionalGraphLoader extends GraphLoader {
	settings: DimensionalGraphLoaderSettings;

	constructor(settings: DimensionalGraphLoaderSettings) {
		super(settings);
	}

	loadDimensionalRow(
		builder: DimensionalGraphBuilder,
		row: GraphLoaderRow,
	) {
		const interval = this.settings.generateInterval(row, builder.size);

		let builderInterval: DimensionalGraphBuilderPage = null;
		if (builder.has(interval.ref)) {
			builderInterval = builder.get(interval.ref);
		} else {
			builderInterval = {
				interval,
				nodes: new Map(),
				events: [],
			};

			builder.set(interval.ref, builderInterval);
		}

		return super.loadRow(builderInterval, row);
	}

	_prepareDimentionalBuilder(
		dGraph: DimensionalGraph,
	): DimensionalGraphBuilder {
		return Array.from(dGraph.intervals.entries()).reduce(
			(agg, [ref, interval]) => {
				const graph = dGraph.getGraph(interval);
				const graphBuilder = this._prepareBuilder(graph);

				agg.set(ref, {
					interval,
					nodes: graphBuilder.nodes,
					events: graphBuilder.events,
				});

				return agg;
			},
			new Map(),
		);
	}

	loadDimensionalJSON(dGraph: DimensionalGraph, arr: GraphLoaderRow[]) {
		const builder = this._prepareDimentionalBuilder(dGraph);

		for (const rowInfo of arr) {
			this.loadDimensionalRow(builder, rowInfo);
		}

		for (const page of builder.values()) {
			const graph = dGraph.getGraph(<Interval>page.interval);

			applyBuilder(graph, page);
		}
	}

	loadDimensionalArray(
		dGraph: DimensionalGraph,
		arr: GraphLoaderValue[][],
		headers = null,
	) {
		const builder = this._prepareDimentionalBuilder(dGraph);

		if (!headers) {
			headers = arr.shift();
		}

		for (const row of arr) {
			const rowInfo = {};

			for (const pos in headers) {
				rowInfo[headers[pos]] = row[pos];
			}

			this.loadDimensionalRow(builder, rowInfo);
		}

		for (const page of builder.values()) {
			const graph = dGraph.getGraph(<Interval>page.interval);

			applyBuilder(graph, page);
		}
	}
}
