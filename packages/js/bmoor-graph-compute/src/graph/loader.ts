import {Context} from '@bmoor/context';
import {
	GraphLoader,
	GraphLoaderRow,
	GraphLoaderValue,
	applyBuilder,
} from '@bmoor/graph';

import {GraphComputeDatumInterface} from '../datum.interface.ts';
import {
	GraphComputeBuilder,
	GraphComputeBuilderPage,
	GraphComputeSelector,
} from '../graph.interface.ts';
import {GraphCompute} from '../graph.ts';
import {GraphComputeLoaderSettings} from './loader.interface.ts';

export class GraphComputeLoader extends GraphLoader<
	GraphComputeDatumInterface<GraphComputeSelector>,
	GraphComputeSelector
> {
	settings: GraphComputeLoaderSettings;

	constructor(settings: GraphComputeLoaderSettings) {
		super(settings);
	}

	loadDimensionalRow(
		ctx: Context,
		builder: GraphComputeBuilder,
		row: GraphLoaderRow,
	) {
		const interval = this.settings.generateInterval(row, builder.size);

		let builderInterval: GraphComputeBuilderPage = null;
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

		try {
			return super.loadRow(ctx, builderInterval, row);
		} catch (ex) {
			if (ex instanceof Error) {
				ctx.setError(ex, {
					code: 'LOADER_LOADDIMROW',
					protected: row,
				});
			}

			throw ex;
		}
	}

	_prepareDimentionalBuilder(dGraph: GraphCompute): GraphComputeBuilder {
		return Array.from(dGraph.intervals.entries()).reduce(
			(agg, [ref, interval]) => {
				const graph = dGraph.getSection(interval);
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

	loadDimensionalJSON(
		ctx: Context,
		dGraph: GraphCompute,
		arr: GraphLoaderRow[],
	) {
		const builder = this._prepareDimentionalBuilder(dGraph);

		for (const rowInfo of arr) {
			this.loadDimensionalRow(ctx, builder, rowInfo);
		}

		for (const page of builder.values()) {
			const graph = dGraph.getSection(page.interval);

			applyBuilder(ctx, graph, page);
		}
	}

	loadDimensionalArray(
		ctx: Context,
		dGraph: GraphCompute,
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

			this.loadDimensionalRow(ctx, builder, rowInfo);
		}

		for (const page of builder.values()) {
			const graph = dGraph.getSection(page.interval);

			applyBuilder(ctx, graph, page);
		}
	}
}
