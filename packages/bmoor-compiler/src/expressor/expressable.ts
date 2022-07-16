// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ExpressableValue = any;

export type ExpressableFunction = (
	...args: ExpressableValue
) => ExpressableValue;

export type ExpressableSettings = any;

export enum Usages {
	operation = 'operation',
	value = 'value'
}

export class Expressable {
	usage: Usages;
	rank: number;
	method: (...args: ExpressableValue) => ExpressableValue;

	constructor(usage: Usages, method: ExpressableFunction, rank = 0) {
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
