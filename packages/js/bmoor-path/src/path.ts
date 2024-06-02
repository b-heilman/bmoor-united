import {DynamicObject} from '@bmoor/object';

import {parser} from './parser';
import {PathInterface, PathLink} from './path.interface';
import {AccessorToken} from './token/accessor';
import {ArrayToken} from './token/array';

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

	getChain(): PathLink[] {
		const rtn: PathLink[] = [];

		const tokens = parser.tokenizer.tokenize(this.structure);
		const leaf = tokens.pop();
		let reference;

		if (tokens.length) {
			const root = tokens.shift();

			if (root instanceof ArrayToken) {
				rtn.push({
					type: 'array',
				});
			}

			reference = tokens.reduce((reference, token) => {
				if (token instanceof AccessorToken) {
					rtn.push({
						type: 'object',
						reference,
					});
				} else {
					rtn.push({
						type: 'array',
						reference,
					});
				}

				// cast '' => undefined
				return token.content || undefined;
			}, root.content);
		}

		if (leaf instanceof AccessorToken) {
			if (reference) {
				rtn.push({
					type: 'object',
					reference,
				});
			}

			rtn.push({
				type: 'leaf',
				reference: leaf.content,
			});
		} else {
			rtn.push({
				type: 'array',
				reference,
			});
			rtn.push({
				type: 'leaf',
			});
		}

		return rtn;
	}
	toString(): string {
		return this.structure;
	}
}
