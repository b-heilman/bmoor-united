import {EventFeaturesWriteMode, EventJSON} from '../event.interface';
import {Graph, applyBuilder} from '../graph';
import {GraphBuilder} from '../graph.interface';
import {load as loadNode} from '../node';
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
	previous: NodeJSON,
) {
	if (typeof accessor === 'function') {
		return accessor(row, previous);
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

function featureCopy(row, features, parser = null) {
	if (parser) {
		return features.reduce((agg, feature) => {
			agg[feature] = parser(row[feature]);

			return agg;
		}, {});
	} else {
		return features.reduce((agg, feature) => {
			agg[feature] = row[feature];

			return agg;
		}, {});
	}
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

			let parent = prev[prev.length - 1] || null;
			for (const row of rows) {
				const node: NodeJSON = {
					ref: accessString(row, settings.ref, parent),
					type: accessString(row, settings.type, parent),
				};

				if (settings.parentRef) {
					node.parentRef = accessString(row, settings.parentRef, parent);
				}

				if (settings.metadata) {
					const metadata: Record<string, string> = {};

					for (const [mount, tag] of Object.entries(settings.metadata)) {
						metadata[mount] = accessString(row, tag, parent);
					}

					node.metadata = metadata;
				}

				if (settings.edges) {
					const edges: Record<string, string[]> = {};

					for (const [mount, edgeFn] of Object.entries(settings.edges)) {
						edges[mount] = edgeFn(row);
					}

					node.edges = edges;
				}

				parent = node;
				prev.push(node);
			}

			return prev;
		};
	}

	addEventGenerator(settings: GraphLoaderEventGeneratorSettings) {
		const old = this.settings.generateEvents;
		this.settings.generateEvents = function (row: GraphLoaderRow) {
			const prev = old(row);

			const features = settings.features
				? featureCopy(row, settings.features, settings.featuresParser)
				: {};

			if (settings.featureValues) {
				for (const key in settings.featureValues) {
					const fv = settings.featureValues[key];

					features[key] = accessValue(row, fv);
				}
			}

			const event: EventJSON = {
				ref: accessString(row, settings.ref, null),
				features,
				connections: settings.connections.map((info) => {
					const cFeatures = info.features
						? featureCopy(row, info.features, info.featuresParser)
						: {};

					if (info.featureValues) {
						for (const key in info.featureValues) {
							const fv = info.featureValues[key];

							cFeatures[key] = accessValue(row, fv);
						}
					}

					return {
						nodeRef: accessString(row, info.nodeRef, null),
						features: cFeatures,
						collision: info.collision || EventFeaturesWriteMode.ignore,
					};
				}),
			};

			prev.push(event);

			return prev;
		};
	}

	loadRow(builder: GraphBuilder, row: GraphLoaderRow) {
		const nodes = this.settings.generateNodes(row);

		for (const nodeJSON of nodes) {
			loadNode(nodeJSON, builder.nodes);
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
