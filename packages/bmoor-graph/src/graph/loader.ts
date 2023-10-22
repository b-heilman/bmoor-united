import {EventFeaturesWriteMode, EventJSON} from '../event.interface';
import {Graph, applyBuilder, prepareNodeJSON} from '../graph';
import {GraphBuilder} from '../graph.interface';
import {NodeJSON} from '../node.interface';
import {
	GraphLoaderEventGeneratorSettings,
	GraphLoaderFeatureValueAccessor,
	GraphLoaderGeneratorStringAccessor,
	GraphLoaderNodeGeneratorSettings,
	GraphLoaderRow,
	GraphLoaderSettings,
	GraphLoaderValue,
} from './loader.interface';

function accessString(
	row: GraphLoaderRow,
	accessor: GraphLoaderGeneratorStringAccessor,
) {
	if (typeof accessor === 'function') {
		return accessor(row);
	} else if (typeof accessor === 'string') {
		return accessor;
	} else {
		throw new Error('boom');
	}
}

function accessValue(
	row: GraphLoaderRow,
	accessor: GraphLoaderFeatureValueAccessor,
) {
	if (typeof accessor === 'function') {
		return accessor(row);
	} else {
		if (
			typeof accessor === 'string' ||
			typeof accessor === 'number' ||
			typeof accessor === 'boolean'
		) {
			return accessor;
		} else {
			throw new Error('boom');
		}
	}
}

function featureCopy(row, features) {
	return features.reduce((agg, feature) => {
		agg[feature] = row[feature];

		return agg;
	}, {});
}

export class GraphLoader {
	settings: GraphLoaderSettings;

	constructor(settings: GraphLoaderSettings = {}) {
		this.settings = settings;

		if (!settings.generateNodes) {
			settings.generateNodes = function () {
				return [];
			};
		}

		if (!settings.generateEvents) {
			settings.generateEvents = function () {
				return [];
			};
		}
	}

	addNodeGenerator(settings: GraphLoaderNodeGeneratorSettings) {
		const old = this.settings.generateNodes;
		this.settings.generateNodes = function (row: GraphLoaderRow) {
			const prev = old(row);

			const rows = settings.rowSplitter
				? settings.rowSplitter(row)
				: [row];

			for (const row of rows) {
				const res: NodeJSON = {
					ref: accessString(row, settings.ref),
					type: accessString(row, settings.type),
				};

				if (settings.parentRef) {
					res.parentRef = accessString(row, settings.parentRef);
				}

				if (settings.metadata) {
					const metadata: Record<string, string> = {};

					for (const [mount, tag] of Object.entries(settings.metadata)) {
						metadata[mount] = accessString(row, tag);
					}

					res.metadata = metadata;
				}

				if (settings.edges) {
					const edges: Record<string, string[]> = {};

					for (const [mount, edgeFn] of Object.entries(settings.edges)) {
						edges[mount] = edgeFn(row);
					}

					res.edges = edges;
				}

				prev.push(res);
			}

			return prev;
		};
	}

	addEventGenerator(settings: GraphLoaderEventGeneratorSettings) {
		const old = this.settings.generateEvents;
		this.settings.generateEvents = function (row: GraphLoaderRow) {
			const features = settings.features
				? featureCopy(row, settings.features)
				: {};

			if (settings.featureValues) {
				for (const key in settings.featureValues) {
					const fv = settings.featureValues[key];

					features[key] = accessValue(row, fv);
				}
			}

			const res: EventJSON = {
				ref: accessString(row, settings.ref),
				features,
				connections: settings.connections.map((info) => {
					const cFeatures = info.features
						? featureCopy(row, info.features)
						: {};

					if (info.featureValues) {
						for (const key in info.featureValues) {
							const fv = info.featureValues[key];

							cFeatures[key] = accessValue(row, fv);
						}
					}

					return {
						nodeRef: accessString(row, info.nodeRef),
						features: cFeatures,
						collision: info.collision || EventFeaturesWriteMode.ignore,
					};
				}),
			};
			const prev = old(row);

			prev.push(res);

			return prev;
		};
	}

	loadRow(builder: GraphBuilder, row: GraphLoaderRow) {
		const nodes = this.settings.generateNodes(row);

		for (const nodeJSON of nodes) {
			prepareNodeJSON(builder, nodeJSON);
		}

		builder.events = builder.events.concat(
			this.settings.generateEvents(row),
		);
	}

	loadJSON(graph: Graph, arr: GraphLoaderRow[]) {
		const builder = {
			nodes: new Map(),
			events: [],
		};

		for (const rowInfo of arr) {
			this.loadRow(builder, rowInfo);
		}

		applyBuilder(graph, builder);
	}

	loadArray(graph: Graph, arr: GraphLoaderValue[][], headers = null) {
		const builder = {
			nodes: new Map(),
			events: [],
		};

		if (!headers) {
			headers = arr.shift();
		}

		for (const row of arr) {
			const rowInfo = {};

			for (const pos in headers) {
				rowInfo[headers[pos]] = row[pos];
			}

			this.loadRow(builder, rowInfo);
		}

		applyBuilder(graph, builder);
	}
}
