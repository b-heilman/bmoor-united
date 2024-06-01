import {PathInterface} from '@bmoor/path';

export type FieldReference = string;

export interface FieldInfo {
	type: string;
	primary: boolean;
	required: boolean;
}

export interface FieldJSON {
	ref?: FieldReference;
	path: string;
	info: FieldInfo;
}

export interface FieldParsed {
	ref?: FieldReference;
	info: FieldInfo;
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	path: PathInterface<any>;
}

export interface FieldPathObject {
	type: 'object';
	reference?: string;
}

export interface FieldPathArray {
	type: 'array';
	reference?: string;
}

export interface FieldPathLeaf {
	type: 'leaf';
	reference?: string; // 
	fieldType: string;
}

export type FieldPathLink = FieldPathObject | FieldPathArray | FieldPathLeaf;

export interface FieldInterface {
	getReference(): FieldReference;
	getInfo(): FieldInfo
	getPath(): string
	getPathChain(): FieldPathLink[]
}
