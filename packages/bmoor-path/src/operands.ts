import {Expressable} from '@bmoor/compiler';
import {cursorTo} from 'readline';

import {ArrayToken} from './token/array';

export type Operand = {
	ops: Expressable[];
	array: Expressable;
};

export class OperandIndex extends Map<string, OperandIndex> {
	ref: string;
	exp: Expressable;
	array: Expressable;

	constructor(ref: string, exp: Expressable = null) {
		super();

		this.ref = ref;
		this.exp = exp;
		this.array = null;
	}

	toJSON() {
		const rtn = {
			ref: this.ref,
			// exp: this.exp,
			array: !!this.array,
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
	arrays: string[];
};

// reduces all Expressables to an series of property maps
export function indexExpressables(
	ref: string,
	exps: Expressable[],
	target: OperandIndex,
	stats?: IndexStats
): IndexStats {
	const arrays = [];
	const priorArrays = stats?.arrays.slice(0) || [];

	exps.reduce((prev: OperandIndex, exp: Expressable, i) => {
		let next: OperandIndex = null;

		if (prev.has(<string>exp.token.content)) {
			next = prev.get(exp.token.content);
		} else {
			const isArray = containsArray(exp);

			if (!(isArray && prev.array)){
				if (i < exps.length - 1) {
					const myRef = isArray && priorArrays.length ? 
						priorArrays.shift() : `${ref}_${i}`;

					next = new OperandIndex(myRef, exp);
				} else {
					const myRef = isArray && priorArrays.length ? 
						priorArrays.shift() : ref;

					// TODO: if it's an array and a leaf, don't rename the above
					next = new OperandIndex(myRef, exp);
				}

				if (isArray) {
					prev.array = exp;
					
					arrays.push(prev.ref);

					next = prev;
				} else {
					prev.set(exp.token.content, next);
				}
			} else {
				// TODO: maybe array merging logic needs to be added
				arrays.push(prev.ref);
				next = prev;
			}
		} 

		return next;
	}, target);

	return {
		arrays
	};
}
