// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ExpressableValue = any;

export type ExpressableFunction = (
	...args: ExpressableValue
) => ExpressableValue;

export enum Usages {
	operation = new Symbol('operation'),
	value = new Symbol('value')
}

export abstract class Expressable {
	abstract eval(...args: ExpressableValue[]): ExpressableValue;

	usage: Usages;
	rank: number;
	method: (...args: ExpressableValue) => ExpressableValue;

	constructor(
		usage: Usages,
		method: (...args: ExpressableValue) => ExpressableValue,
		rank = 0
	) {
		this.usage = usage;
		this.rank = rank;
		this.method = method;
	}

	prepare(): ExpressableFunction {
		return (...args: ExpressableValue[]) => {
			return this.eval(...args);
		};
	}

	toJSON() {
		return {usage: this.usage, method: this.method.name};
	}

	toString() {
		return `{"usage":"${this.usage}", "method":"${this.method.name}"}`;
	}
}
