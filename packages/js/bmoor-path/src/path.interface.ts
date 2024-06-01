import {DynamicObject} from '@bmoor/object';

export interface PathInterface<T> {
	getReader(): (root: DynamicObject<T>) => T;
	read(root: DynamicObject<T>): T;

	getWriter(): (root: DynamicObject<T>, v: T) => void;
	write(root: DynamicObject<T>, v: T): void;

	toString(): string;
}
