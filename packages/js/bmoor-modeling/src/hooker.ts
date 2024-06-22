import {HookInterface, HookReference} from './hook.interface';
import {HookerInterface} from './hooker.interface';

export class Hooker implements HookerInterface {
	index: Record<HookReference, HookInterface>;

	constructor(types: Record<HookReference, HookInterface> = {}) {
		this.index = types;
	}

	clear() {
		this.index = {};
	}

	define(types: Record<HookReference, HookInterface>) {
		this.index = {...this.index, ...types};
	}

	addHook(type: HookReference, info: HookInterface) {
		this.index[type] = info;
	}

	getHook(type: HookReference): HookInterface {
		return this.index[type];
	}
}

export const hooks = new Hooker({
	createTimestamp: {
		onCreate: () => Date.now(),
	},
	updateTimestamp: {
		onUpdate: () => Date.now(),
	},
	changeTimestamp: {
		onCreate: () => Date.now(),
		onUpdate: () => Date.now(),
	},
	readTimestamp: {
		onRead: () => Date.now(),
	},
});
