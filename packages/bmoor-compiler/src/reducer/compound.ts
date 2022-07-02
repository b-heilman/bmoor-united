// eslint-disable-next-line  @typescript-eslint/no-explicit-any
import {Expressable} from '../expressor/expressable';
import {ExpressableToken, Token} from '../tokenizer/token';

export abstract class Compound implements ExpressableToken {
	// https://github.com/microsoft/TypeScript/issues/34516
	static pieces: typeof Token[] = [];

	abstract toExpressable(): Expressable[];

	tokens: Token[];

	constructor(tokens: Token[]) {
		this.tokens = tokens;
	}

	getReference() {
		return 'compound:' + this.tokens.map((p) => p.getReference()).join('-');
	}
}
