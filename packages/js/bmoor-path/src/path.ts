import {Token, Tokenizer} from '@bmoor/compiler';
import {DynamicObject} from '@bmoor/object';

import {parser} from './parser';
import {PathInterface} from './path.interface';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export class Path<T = any> implements PathInterface<T> {
	structure: string;
	reader?: (root: DynamicObject<T>) => T;
	writer?: (root: DynamicObject<T>, v: T) => void;

	constructor(path: string) {
		this.structure = path;
	}

	getReader() {
		if (!this.reader) {
			this.reader = parser.getReader(this.structure);
		}

		return this.reader;
	}
	read(root: DynamicObject<T>): T {
		return this.getReader()(root);
	}

	getWriter() {
		if (!this.writer) {
			this.writer = parser.getWriter(this.structure);
		}

		return this.writer;
	}

	write(root: DynamicObject<T>, v: T): void {
		this.getWriter()(root, v);
	}
	
	toString(): string {
		return this.structure;
	}
}
