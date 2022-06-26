// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ExpressableValue = any;

export abstract class Expressable {
	type: string;
	rank: number;
	method: (...args: ExpressableValue) => ExpressableValue;

	constructor(
		type,
		method: (...args: ExpressableValue) => ExpressableValue,
		rank = null
	) {
		this.type = type;
		this.rank = rank;
		this.method = method;
	}

	abstract eval(...args: ExpressableValue[]): ExpressableValue;

	prepare(): (...args: ExpressableValue) => ExpressableValue {
		return (...args: ExpressableValue[]) => {
			return this.eval(...args);
		};
	}

	toJSON() {
		return {type: this.type, method: this.method.name};
	}

	toString() {
		return `{"type":"${this.type}", "method":"${this.method.name}"}`;
	}
}
