import {EventFeaturesWriteMode, EventJSON} from '../event.interface.ts';
import {NodeJSON, NodeReference} from '../node.interface.ts';

export type GraphLoaderValue = string | number | boolean;
export type GraphLoaderFeature = string;
export type GraphLoaderRow = Record<GraphLoaderFeature, GraphLoaderValue>;

export type GraphLoaderSplitter = (
	row: GraphLoaderRow,
) => GraphLoaderRow[];

export type GraphLoaderNodeGenerator = (row: GraphLoaderRow) => NodeJSON[];
export type GraphLoaderEventGenerator = (
	row: GraphLoaderRow,
) => EventJSON[];

export type GraphLoaderGeneratorStringFn = (
	row: GraphLoaderRow,
	previous?: NodeJSON,
) => string;
export type GraphLoaderGeneratorStringAccessor =
	| string
	| GraphLoaderGeneratorStringFn;

export type GraphLoaderFeatureValueFn = (
	row: GraphLoaderRow,
) => GraphLoaderValue;

export type GraphLoaderFeatureValueAccessor =
	| GraphLoaderValue
	| GraphLoaderFeatureValueFn;

export type GraphLoaderEdgeFn = (row: GraphLoaderRow) => NodeReference[];

export interface GraphLoaderNodeGeneratorSettings {
	ref: GraphLoaderGeneratorStringAccessor;
	parentRef?: GraphLoaderGeneratorStringAccessor;

	rowSplitter?: GraphLoaderSplitter;

	type: GraphLoaderGeneratorStringAccessor;
	metadata?: Record<string, GraphLoaderGeneratorStringAccessor>;
	edges?: Record<string, GraphLoaderEdgeFn>;
	/**
	 * I'm removing these because features on nodes should be
	 * current state, which should come from events
	 *-----
	 * features: string[];
	 * featureValues?: GraphLoaderFeatureValueAccessor[];
	 **/
}

export interface GraphLoaderEventGeneratorSettings {
	ref: GraphLoaderGeneratorStringAccessor;

	features?: string[];
	featuresParser?: (GraphLoaderValue) => GraphLoaderValue;
	featureValues?: Record<string, GraphLoaderFeatureValueAccessor>;

	connections: {
		nodeRef: GraphLoaderGeneratorStringAccessor;
		features?: string[];
		featuresParser?: (GraphLoaderValue) => GraphLoaderValue;
		featureValues?: Record<string, GraphLoaderFeatureValueAccessor>;
		collision?: EventFeaturesWriteMode;
	}[];
}

export interface GraphLoaderSettings {
	generateNodes?: GraphLoaderNodeGenerator;
	generateEvents?: GraphLoaderEventGenerator;
}
