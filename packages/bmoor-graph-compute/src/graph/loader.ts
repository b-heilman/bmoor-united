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
		const intervalRef = this.settings.readIntervalReference(row);

		let interval: DimensionalGraphBuilderPage = null;
		if (builder.has(intervalRef)) {
			interval = builder.get(intervalRef);
		} else {
			interval = {
				interval: this.settings.generateInterval(
					intervalRef,
					row,
					builder.size,
				),
				nodes: new Map(),
				events: [],
			};

			builder.set(intervalRef, interval);
		}

		return super.loadRow(interval, row);
	}

	loadDimensionalJSON(dGraph: DimensionalGraph, arr: GraphLoaderRow[]) {
		const builder = new Map();

		for (const rowInfo of arr) {
			this.loadDimensionalRow(builder, rowInfo);
		}

		for (const page of builder.values()) {
			const graph = dGraph.getGraph(page.interval);

			applyBuilder(graph, page);
		}
	}

	loadDimensionalArray(
		dGraph: DimensionalGraph,
		arr: GraphLoaderValue[][],
		headers = null,
	) {
		const builder = new Map();

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
			const graph = dGraph.getGraph(page.interval);

			applyBuilder(graph, page);
		}
	}
}
