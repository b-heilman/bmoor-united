import {Expressable} from '../expressor/expressable';
import {
	ExpressableFunction,
	ExpressableUsages,
} from '../expressor/expressable.interface';
import {Pattern} from '../tokenizer/pattern';
import {TokenizerState} from '../tokenizer/state';
import {Token} from '../tokenizer/token';

export class ValueToken extends Token {
	static reference = 'value';

	toExpressable() {
		return new Expressable(
			this,
			ExpressableUsages.value,
			() => this.content,
		);
	}
}

export class RegexValuePattern extends Pattern {
	pattern: RegExp;
	subType: string;
	parser: ExpressableFunction;

	constructor(
		pattern: RegExp,
		parser: ExpressableFunction,
		subType: string,
	) {
		super();

		this.pattern = pattern;
		this.parser = parser;
		this.subType = subType;
	}

	open(str: string, pos: number) {
		const ch = str[pos];

		if (this.pattern.test(ch)) {
			return new TokenizerState(pos);
		}

		return null;
	}

	close(str: string, pos: number, state: TokenizerState) {
		const ch = str[pos];

		if (!this.pattern.test(ch)) {
			state.setClose(pos);
			return pos - 1;
		}

		return null;
	}

	toToken(base: string, state: TokenizerState) {
		return new ValueToken(
			this.parser(base.substring(state.open, state.close)),
			state,
			{
				subType: this.subType,
			},
		);
	}

	getReference() {
		return this.pattern.toString();
	}
}

export class OpToken extends Token {
	static reference = 'operation';

	toExpressable() {
		return new Expressable(
			this,
			ExpressableUsages.operation,
			(a, b) => this.content(a, b),
			{
				rank: parseInt(this.settings.subType) || 5,
			},
		);
	}
}

export class RegexOpPattern extends RegexValuePattern {
	toToken(base: string, state: TokenizerState) {
		return new OpToken(this.parser, state, {
			subType: this.subType,
		});
	}
}
