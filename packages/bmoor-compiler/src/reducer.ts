import {Compound} from './reducer/compound';
import {
	ExpressableToken,
	Token,
	TokenReference,
	TokenConstructor
} from './tokenizer/token';

type CompoundConstructor = {
	new (tokens: Token[]): Compound;
	pieces: TokenConstructor[];
};

type TreeBranch = {
	value: CompoundConstructor;
	next: Map<TokenReference, TreeBranch>;
};

function treeBuilder(arr: CompoundConstructor[]): TreeBranch {
	const root: TreeBranch = {
		value: null,
		next: new Map<TokenReference, TreeBranch>()
	};

	for (let i = 0, c = arr.length; i < c; i++) {
		const Construct = arr[i];
		const tokens = Construct.pieces;

		let cur = root;

		const path = [];
		for (let ii = 0, cc = tokens.length; ii < cc; ii++) {
			const Token = tokens[ii];
			const tokenRef = Token.reference;
			const next = cur.next;

			path.push(tokenRef);

			cur = cur.next.get(tokenRef);
			if (!cur) {
				cur = {
					value: null,
					next: new Map<TokenReference, TreeBranch>()
				};

				next.set(tokenRef, cur);
			}
		}

		cur.value = Construct;
	}

	return root;
}

type TreeHistory = {
	value: CompoundConstructor;
	token: Token;
};

function unwrapHistory(target, history) {
	const misses = [];

	while (history.length && !history[history.length - 1].value) {
		misses.unshift(history.pop().token);
	}

	if (history.length) {
		const Compounder = history[history.length - 1].value;
		target.push(new Compounder(history.map((h) => h.token)));
	}

	target.push(...misses);
}

export class Reducer {
	compoundTree: TreeBranch;

	// https://www.typescriptlang.org/docs/handbook/2/generics.html#using-class-types-in-generics
	constructor(compounds: CompoundConstructor[]) {
		this.compoundTree = treeBuilder(compounds);
	}

	reduce(tokens: Token[]): ExpressableToken[] {
		const rtn: ExpressableToken[] = [];

		let cursor: TreeBranch = this.compoundTree;
		let history: TreeHistory[] = [];

		for (let i = 0, c = tokens.length; i < c; i++) {
			const token = tokens[i];
			const ref = token.getReference();
			const next = cursor.next.get(ref);

			if (next) {
				cursor = next;

				history.push({
					token,
					value: cursor.value
				});
			} else if (history.length) {
				// we will need to try the token again
				i--;

				unwrapHistory(rtn, history);

				cursor = this.compoundTree;
				history = [];
			} else {
				rtn.push(token);
			}
		}

		if (history.length) {
			unwrapHistory(rtn, history);
		}

		return rtn;
	}
}
