import {ActionInterface, ActionReference} from './action.interface';

export interface RegistryInterface<NodeSelector, IntervalRef> {
	addAction(def: ActionInterface<NodeSelector, IntervalRef>): void;

	hasAction(feature: ActionReference): boolean;

	getAction(
		feature: ActionReference,
	): ActionInterface<NodeSelector, IntervalRef>;
}
