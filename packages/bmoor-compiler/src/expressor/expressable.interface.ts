// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ExpressableValue = any;

export type ExpressableFunction = (
	...args: ExpressableValue
) => ExpressableValue;

export enum ExpressableUsages {
	operation = 'operation',
	value = 'value'
}
