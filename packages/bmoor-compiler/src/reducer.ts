import {Compound} from '../reducer/compound';
import {ExpressableToken} from '../tokenizer/token';

type TreeBranch = {
	value: Compound;
	next: {
		[Token]: TreeBranch;
	};
};

function treeBuilder(arr: Compound[]): TreeBranch {
	const root: TreeBranch = {
		value: null,
		next: {}
	};

	for (let i = 0, c = arr.length; i < c; i++) {
		const compound = arr[i];
		const tokens = compounds.getPieces();

		let cur = root;

		for (let ii = 0, cc = tokens.length; ii < cc; ii++) {
			const token = tokens[ii];
			const next = cur.next;

			cur = cur.next[token];

			if (!cur) {
				cur = {
					value: null,
					next: {}
				};
				next[token] = cur;
			}
		}

		cur.value = compound;
	}

	return root;
}

type TreeHistory = {
	value: Compound;
	token: Token;
};

export class Reducer {
	compoundTree: TreeBranch;

	constructor(compounds: Compound[]) {
		this.compoundTree = treeBuilder(compounds);
	}

	reduce(tokens: Token[]): ExpressableToken[] {
		const rtn: ExpressableToken[] = [];

		let cursor: TreeBranch = this.compoundTree;
		let history: TreeHistory[] = [];

		for (let i = 0, c = tokens.length; i < c; i++) {
			const token = tokens[i];
			const next = cursor.next[token];

			if (next) {
				history.push({
					token,
					value: cursor.value
				});

				cursor = next;
			} else if (history.length) {
				// we will need to try the token again
				i--;

				const misses = [];

				while (history.length && !history[history.length - 1].value) {
					misses.unshift(history.pop().token);
				}

				if (history.length) {
					const Constructor = history[history.length - 1].value;
					rtn.push(new Constructor(history.map((h) => h.token)));
				}

				rtn.push(...misses);

				cursor = this.compoundTree;
				history = [];
			}
		}

		return rtn;
	}
}
