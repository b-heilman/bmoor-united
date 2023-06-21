import {Action, ActionReference} from '@bmoor/compute';

import {Selector, SelectorOverride} from '../index.interface';

export class ActionPull extends Action<Selector, SelectorOverride> {
	constructor(ref: ActionReference) {
		super(ref);
	}

	async eval(selector: Selector): Promise<number> {
		return 0;
	}
}
