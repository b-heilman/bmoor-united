import {
	ExpressableValue,
	ExpressableFunction,
	ExpressableUsages
} from './expressable.interface';

export class Expressable {
	usage: ExpressableUsages;
	rank: number;
	method: (...args: ExpressableValue) => ExpressableValue;

	constructor(usage: ExpressableUsages, method: ExpressableFunction, rank = 0) {
		this.usage = usage;
		this.method = method;
		this.rank = rank;
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
