import {Expressable} from '@bmoor/compiler';
import {cursorTo} from 'readline';

import {ArrayToken} from './token/array';

export type Operand = {
	ops: Expressable[];
	array: Expressable;
};

export type ArrayInfo = {
	exp: Expressable;
	ref: string; // property to read / write the array from
	leafRef: string; // properto to read / write the value to
	sources?: string[];
};

export class OperandIndex extends Map<string, OperandIndex> {
	ref: string;
	exp: Expressable;
	array: ArrayInfo[];
	filter: string;

	constructor(ref: string, exp: Expressable = null, filter = null) {
		super();

		this.ref = ref;
		this.exp = exp;
		this.array = [];
		this.filter = filter;
	}

	toJSON() {
		const rtn = {
			ref: this.ref,
			// exp: this.exp,
			array: this.array.map((arrayInfo) => ({
				ref: arrayInfo.ref,
				leafRef: arrayInfo.leafRef,
				sources: arrayInfo.sources
			})),
			next: null,
			filter: null
		};

		if (this.size) {
			const next = {};
			for (
				let iterator = this.entries(), cur = iterator.next();
				!cur.done;
				cur = iterator.next()
			) {
				const [key, value] = cur.value;

				next[key] = value.toJSON();
			}

			rtn.next = next;
		}

		if (this.filter) {
			rtn.filter = this.filter;
		} else {
			delete rtn.filter;
		}

		return rtn;
	}
}

export function containsArray(exp: Expressable): boolean {
	return exp.token instanceof ArrayToken;
}

export function reduceExpressables(ops: Expressable[]): Operand[] {
	// convert tthe ops into multiple sets of path accessors and
	// array modifiers
	const rtn = ops.reduce(
		(agg, exp) => {
			let cur = agg[0];

			if (!cur) {
				cur = {
					ops: [],
					array: null
				};

				agg[0] = cur;
			}

			if (containsArray(exp)) {
				cur.array = exp;

				agg.unshift(null);
			} else {
				cur.ops.push(exp);
			}

			return agg;
		},
		[null]
	);

	// We need to remove the first one if it's still null
	if (!rtn[0]) {
		rtn.shift();
	}

	// need to flip this, is this wasteful?  Maybe?
	return rtn.reverse();
}

export type IndexStats = {
	ref?: string;
	arrays: string[];
};

// reduces all Expressables to an series of property maps
export function indexExpressables(
	ref: string,
	exps: Expressable[],
	target: OperandIndex,
	stats: IndexStats = {arrays: []}
): IndexStats {
	const last = exps.length - 1;
	const arrays = [];
	const priorArrays = stats.arrays.slice(0);
	const isWriting = !!priorArrays.length; // I think this is ok for now

	let count = 0;
	let arrPos = 0;
	let curFilter = null;

	function getNextInterstitialReference() {
		return `${ref}_${count++}`;
	}

	exps.reduce((prev: OperandIndex, exp: Expressable, i) => {
		const isLeaf = i === last;
		const isArray = containsArray(exp);

		let next: OperandIndex = null;

		if (isArray) {
			// .foo[]
			// [][]
			if (curFilter === null) {
				arrPos = 0;
			}

			if (arrPos < prev.array.length) {
				// second pass
				const arrayInfo = prev.array[arrPos];

				let myRef = null;

				if (isWriting) {
					myRef = priorArrays.shift();

					if (!arrayInfo.sources.includes(myRef)) {
						arrayInfo.sources.push(myRef);
					}
				} else {
					myRef = arrayInfo.ref;
				}

				if (isLeaf) {
					ref = arrayInfo.leafRef;
				}

				curFilter = myRef;
				arrays.push(myRef);
			} else {
				// first pass
				const arrayRef = priorArrays.length
					? priorArrays.shift()
					: getNextInterstitialReference();

				prev.array.push({
					exp,
					ref: arrayRef,
					sources: isWriting ? [arrayRef] : null,
					leafRef: isLeaf ? stats.ref || ref : null
				});

				curFilter = arrayRef;
				arrays.push(arrayRef);
			}

			arrPos++;
			next = prev;
		} else {
			if (prev.has(<string>exp.token.content)) {
				// .bar.eins and .bar.zwei
				next = prev.get(exp.token.content);

				if (isLeaf) {
					// this means I am duplicating the final value.
					ref = next.ref;
				}
			} else {
				// .bar, but first pass
				let myRef = null;

				if (isLeaf) {
					myRef = stats.ref || ref;

					ref = myRef;
				} else {
					myRef = getNextInterstitialReference();
				}

				next = new OperandIndex(myRef, exp, curFilter);

				prev.set(exp.token.content, next);
			}

			curFilter = null;
		}

		return next;
	}, target);

	return {
		ref,
		arrays
	};
}
