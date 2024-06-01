import {
	TypingInfo,
	TypingInterface,
	TypingReference,
} from './typing.interface';

export class Typing implements TypingInterface {
	index: Record<TypingReference, TypingInfo>;

	constructor(types: Record<TypingReference, TypingInfo> = {}) {
		this.index = types;
	}

	addType(type: TypingReference, info: TypingInfo) {
		this.index[type] = info;
	}

	getType(type: TypingReference): TypingInfo {
		return this.index[type];
	}
}

export const types = new Typing({
	string: {
		json: 'string',
	},
	number: {
		json: 'number',
	},
});
