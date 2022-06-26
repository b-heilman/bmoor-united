
import {State} from '../state';

interface TokenSettings {
	subType: string
}

abstract class Token<T> {
	state: State;
	content: T;
	settings: TokenSettings;

	constructor(type: string, content: T, settings: TokenSettings){
		this.type = type;
		this.content = content;
		this.settings = settings;
	}

	setState(state: State){
		this.state = state;
	}

	toExpressable(): Expressable[]{
		throw new Error('must be overriden');
	}

	// TODO: assign(incoming: TokenInterface)

	toJSON() {
		return {
			type: this.type,
			value: this.value,
			settings: this.settings
		};
	}
}