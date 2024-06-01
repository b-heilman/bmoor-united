import {
	TypingInfo,
	TypingInterface,
	TypingReference,
} from './typing.interface';

export class Typing implements TypingInterface {
	index: Record<TypingReference, TypingInfo>;

	constructor() {
		this.index = {};
	}

	addType(type: TypingReference, info: TypingInfo) {
		this.index[type] = info;
	}

	getType(type: TypingReference): TypingInfo {
		return this.index[type];
	}
}
