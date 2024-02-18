import {ExpressableToken} from '../tokenizer/token.interface';
import {
	ExpressableFunction,
	ExpressableSettings,
	ExpressableUsages,
	ExpressableValue,
} from './expressable.interface';

export class Expressable {
	usage: ExpressableUsages;
	token: ExpressableToken;
	settings: ExpressableSettings;
	method: (...args: ExpressableValue) => ExpressableValue;

	constructor(
		token: ExpressableToken,
		usage: ExpressableUsages,
		method: ExpressableFunction,
		settings: ExpressableSettings = {rank: 0},
	) {
		this.token = token;
		this.usage = usage;
		this.method = method;
		this.settings = settings;
	}

	prepare(): ExpressableFunction {
		return (...args: ExpressableValue[]) => {
			return this.method(...args);
		};
	}

	eval(...args: ExpressableValue[]): ExpressableValue {
		return this.method(...args);
	}

	toJSON() {
		return {usage: this.usage, method: this.method.name};
	}

	toString() {
		return `{"usage":"${this.usage}", "method":"${this.method.name}"}`;
	}
}
