import {FeatureReference} from './datum.interface';

export type ActionReference = string;

export interface ActionRequirementRelation {
	offset?: number;
	range?: number;
}

export interface ActionRequirementBase<NodeSelector>
	extends ActionRequirementRelation {
	select?: NodeSelector;
}

export interface ActionRequirementFeature<NodeSelector>
	extends ActionRequirementBase<NodeSelector> {
	feature: FeatureReference;
}

export interface ActionRequirementAction<NodeSelector, IntervalRef>
	extends ActionRequirementBase<NodeSelector> {
	action: ActionInterface<NodeSelector, IntervalRef>;
}

export type ActionRequirement<NodeSelector, IntervalRef> =
	| ActionRequirementFeature<NodeSelector>
	| ActionRequirementAction<NodeSelector, IntervalRef>;

export type ActionValue = number | number[];

// common interface for a data source to be hooked back into the calculator
export interface ActionInterface<NodeSelector, IntervalRef> {
	ref: ActionReference;

	getRequirements(): ActionRequirement<NodeSelector, IntervalRef>[];

	// execute an action against a datum at a particular time
	execute(values: ActionValue[]): Promise<number>;
}

export type ActionFeature<NodeSelector, IntervalRef> =
	| FeatureReference
	| ActionInterface<NodeSelector, IntervalRef>;
