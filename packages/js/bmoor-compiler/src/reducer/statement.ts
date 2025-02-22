import {Expressable} from '../expressor/expressable';
import {Token, TokenConstructor} from '../tokenizer/token';
import {ExpressableToken} from '../tokenizer/token.interface';

export type StatementConstructor = {
	new (tokens: Token[]): Statement;
	pieces: TokenConstructor[];
};

export abstract class Statement implements ExpressableToken {
	// https://github.com/microsoft/TypeScript/issues/34516
	static pieces: (typeof Token)[] = [];

	abstract toExpressable(): Expressable;

	tokens: Token[];
	content: string;

	constructor(tokens: Token[]) {
		this.tokens = tokens;
		this.content = tokens.map((token) => token.content).join(':');
	}

	getReference() {
		return (
			'compound:' + this.tokens.map((p) => p.getReference()).join('-')
		);
	}
}
