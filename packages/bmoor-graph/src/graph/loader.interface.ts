import {Tags} from '@bmoor/tagging';

import {WeightData} from '../weights.interface';

export type InputValue = string | number;
export type InputRow = Record<string, InputValue>;

export type LoaderVariableFn = (InputRow) => InputValue;
export type LoaderVariableTemplate = string;

export type LoaderWeightNormalizer = (
	row: InputRow,
	ref: string,
) => WeightData;

export interface LoaderVariableSetting {
	mount: string;
	normalizer?: (value: string | number) => string | number;
}

export type LoaderTagsParser = (row: InputRow) => string[];

export type LoaderVariable =
	| LoaderVariableFn
	| LoaderVariableTemplate
	| LoaderVariableSetting;

// External representation
export interface LoaderNodeSettings {
	type: string;
	reference: LoaderVariable;
	tag?: LoaderVariable;
	tags?: LoaderTagsParser;
	normalizer?: LoaderWeightNormalizer;
}

// Internal representation after I've normalized in computeNodeInfo
export interface LoaderNodeInfo {
	type: string;
	reference: string;
	tags: Tags;
	normalizer?: LoaderWeightNormalizer;
}

export interface LoaderEventSettings {
	reference: LoaderVariable;
	interval: LoaderVariable;
	label?: LoaderVariable;
	tags?: LoaderTagsParser;
	normalizer?: LoaderWeightNormalizer;
}

export interface LoaderSettings {
	nodes: LoaderNodeSettings[];
	event: LoaderEventSettings;
	split?: (row: InputRow) => InputRow[];
}
