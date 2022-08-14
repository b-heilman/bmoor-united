import {Expressable} from '@bmoor/compiler';

import {ArrayToken} from './token/array';

export type Operand = {
	ops: Expressable[];
	array: Expressable;
};

export type OperandIndex = Map<
	string,
	{
		exp: Expressable;
		isArray: boolean;
		ref: string;
		next?: OperandIndex;
	}
>;

export type IndexStats = {
	arrays: number
}

export function containsArray(exp: Expressable): boolean {
	return (exp.token instanceof ArrayToken);	
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
			next = prev.get(exp.token.content).next;
		} else {
			const isArray = containsArray(exp);

			let cur = null;

			// I would love to not do this, but for now...
			if (i < exps.length - 1) {
				next = new Map();

				cur = {
					exp,
					isArray,
					ref: `${ref}_${i}`,
					next
				};
			} else {
				next = null;

				cur = {
					exp,
					isArray,
					ref
				};
			}

			prev.set(exp.token.content, cur);
		}

		return next;
	}, target);

	return {
		arrays: count
	};
}