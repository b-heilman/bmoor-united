import {
	ActionInterface,
	ActionReference,
	ActionRequirement,
	ActionValue,
} from './action.interface';

export abstract class Action<NodeSelector, IntervalRef>
	implements ActionInterface<NodeSelector, IntervalRef>
{
	ref: ActionReference;

	constructor(ref: ActionReference) {
		this.ref = ref;
	}

	abstract getRequirements(): ActionRequirement<
		NodeSelector,
		IntervalRef
	>[];

	abstract execute(values: ActionValue[]): Promise<number>;
}
