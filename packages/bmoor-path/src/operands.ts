import {Expressable} from '@bmoor/compiler';
import {cursorTo} from 'readline';

import {ArrayToken} from './token/array';

export type Operand = {
	ops: Expressable[];
	array: Expressable;
};

export type ArrayInfo = {
	exp: Expressable;
	isLeaf: boolean;
	ref: string
};

export class OperandIndex extends Map<string, OperandIndex> {
	ref: string;
	exp: Expressable;
	array: ArrayInfo[];

	constructor(ref: string, exp: Expressable = null) {
		super();

		this.ref = ref;
		this.exp = exp;
		this.array = [];
	}

	toJSON() {
		const rtn = {
			ref: this.ref,
			// exp: this.exp,
			array: this.array.map(arrayInfo => ({
				ref: arrayInfo.ref,
				isLeaf: arrayInfo.isLeaf
			})),
			next: null
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
	console.log('=>', priorArrays);
	let count = 0;

	exps.reduce((prev: OperandIndex, exp: Expressable, i) => {
		const isLeaf = i === last;

		let next: OperandIndex = null;

		// TODO: stats needs to return back the actual ref used, incase there's
		//   a conflict on sources
		if (prev.has(<string>exp.token.content)) {
			next = prev.get(exp.token.content);

			if (isLeaf) {
				// this means I am duplicating the final value.  So I think
				// the ref should be saved
				ref = next.ref;
			}
		} else {
			const isArray = containsArray(exp);

			if (!(isArray && prev.array.length)) {
				let myRef = null;

				if (isLeaf) {
					myRef = ref;
				} else {
					myRef = `${ref}_${count}`;

					count++;
				}

				next = new OperandIndex(myRef, exp);

				if (isArray) {
					const arrayRef = priorArrays.length ? 
						priorArrays.shift() : (stats.ref || myRef);

					console.log('array-push');
					prev.array.push({
						exp,
						ref: arrayRef,
						isLeaf
					});

					arrays.push(arrayRef);

					next = prev;
				} else {
					prev.set(exp.token.content, next);
				}
			} else {
				// TODO: maybe array merging logic needs to be added
				arrays.push(prev.array[0].ref);
				next = prev;
			}
		}

		return next;
	}, target);

	return {
		ref,
		arrays
	};
}
