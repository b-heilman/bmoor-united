// eslint-disable-next-line  @typescript-eslint/no-explicit-any
import {ExpressableToken, Token} from '../tokenizer/token';

export abstract class Compound extends ExpressableToken {
	static abstract pieces: Token[];

	abstract toExpressable(): Expressable[];

	tokens: Token[];

	constructor(tokens: Token[]) {
		this.tokens = tokens;
	}

	getReference() {
		return 'compound:' + this.tokens.map((p) => p.getReference()).join('-');
	}
}
