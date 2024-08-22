import {DynamicObject} from '@bmoor/object';

export interface PathObject {
	type: 'object';
	reference?: string;
}

export interface PathArray {
	type: 'array';
	reference?: string;
}

export interface PathLeaf {
	type: 'leaf';
	reference?: string;
	// TODO: this goes a level up
	// fieldType: string;
}

export type PathLink = PathObject | PathArray | PathLeaf;

export interface PathInterface<T> {
	getReader(): (root: DynamicObject<T>) => T;
	read(root: DynamicObject<T>): T;

	getWriter(): (root: DynamicObject<T>, v: T) => void;
	write(root: DynamicObject<T>, v: T): void;

	getChain(): PathLink[];
	toString(): string;
}
