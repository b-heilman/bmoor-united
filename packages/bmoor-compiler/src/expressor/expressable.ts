// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ExpressableValue = any;

export type ExpressableFunction = (
	...args: ExpressableValue
) => ExpressableValue;

export enum ExpressablePosition {
	first = 'first',
	last = 'last',
	middle = 'middle'
}

export interface ExpressableSettings {
	position?: ExpressablePosition;
}

export enum ExpressableUsages {
	operation = 'operation',
	value = 'value'
}

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
