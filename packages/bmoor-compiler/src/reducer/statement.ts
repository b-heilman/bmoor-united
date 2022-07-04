// eslint-disable-next-line  @typescript-eslint/no-explicit-any
import {Expressable} from '../expressor/expressable';
import {ExpressableToken, Token, TokenConstructor} from '../tokenizer/token';

export type StatementConstructor = {
	new (tokens: Token[]): Statement;
	pieces: TokenConstructor[];
};

export abstract class Statement implements ExpressableToken {
	// https://github.com/microsoft/TypeScript/issues/34516
	static pieces: typeof Token[] = [];

	abstract toExpressable(): Expressable;

	tokens: Token[];

	constructor(tokens: Token[]) {
		this.tokens = tokens;
	}

	getReference() {
		return 'compound:' + this.tokens.map((p) => p.getReference()).join('-');
	}
}
