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

export type IndexStats = {
	arrays: number;
};

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

// reduces all Expressables to an series of property maps
export function indexExpressables(
	ref: string,
	exps: Expressable[],
	target: OperandIndex
): IndexStats {
	let count = 0;

	exps.reduce((prev: OperandIndex, exp: Expressable, i) => {
		let next: OperandIndex = null;

		if (prev.has(<string>exp.token.content)) {
			next = prev.get(exp.token.content);
		} else {
			const isArray = containsArray(exp);

			count++;

			if (i < exps.length - 1) {
				next = new OperandIndex(`${ref}_${i}`, exp);
			} else {
				if (isArray) {
					prev.ref = ref;
				} else {
					next = new OperandIndex(ref, exp);
				}
			}

			if (isArray) {
				prev.array = exp;
				// TODO: array operator
				next = prev;
			} else {
				prev.set(exp.token.content, next);
			}
		}

		return next;
	}, target);

	return {
		arrays: count
	};
}
