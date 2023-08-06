import {Action} from '../action';
import {ActionReference, ActionRequirement} from '../action.interface';
import {ActionRequireThenFn} from './require.interface';

export class ActionRequire<NodeSelector, IntervalRef> extends Action<
	NodeSelector,
	IntervalRef
> {
	fn: ActionRequireThenFn;
	requirements: ActionRequirement<NodeSelector, IntervalRef>[];

	constructor(ref: ActionReference) {
		super(ref);

		this.requirements = [];
	}

	require(
		requirement: ActionRequirement<NodeSelector, IntervalRef>,
	): ActionRequire<NodeSelector, IntervalRef> {
		this.requirements.push(requirement);

		return this;
	}

	then(fn: ActionRequireThenFn): void {
		this.fn = fn;
	}

	getRequirements(): ActionRequirement<NodeSelector, IntervalRef>[] {
		return this.requirements;
	}

	async execute(includes: (number | number[])[]): Promise<number> {
		return this.fn(...includes);
	}
}
