import {WeightData} from '../weights.interface';

export type InputValue = string | number;
export type InputRow = Record<string, InputValue>;

export type LoaderVariableFn = (InputRow) => InputValue;
export type LoaderVariableTemplate = string;

export type LoaderWeightNormalizer = (row: InputRow) => WeightData;

export interface LoaderVariableSetting {
	mount?: string;
	normalizer?: (value: string | number) => string | number;
}

export type LoaderVariable =
	| LoaderVariableFn
	| LoaderVariableTemplate
	| LoaderVariableSetting;

// External representation
export interface LoaderNodeSettings {
	type: string;
	reference: LoaderVariable;
	tag?: LoaderVariable;
	normalizer?: LoaderWeightNormalizer;
}

// Internal representation
export interface LoaderNodeInfo {
	type: string;
	reference: string;
	tag?: string;
	normalizer?: LoaderWeightNormalizer;
}

export interface LoaderEventSettings {
	reference: LoaderVariable;
	interval: LoaderVariable;
	label?: LoaderVariable;
}

export interface LoaderSettings {
	nodes: LoaderNodeSettings[];
	event: LoaderEventSettings;
}
