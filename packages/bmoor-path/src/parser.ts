
import {Pattern, Token, TokenizerState, Compiler} from '@bmoor/compiler';

const isVariable = /[A-Za-z_0-9]/;

export class AccessorToken {

}

export class ArrayToken {

}

export class DotPattern {
	open(str: string, pos: number) {
		const ch = str[pos];

		if (isVariable.test(ch)) {
			return new TokenizerState(pos);
		}

		return null;
	}

	close(str: string, pos: number, state: TokenizerState) {
		const ch = str[pos];

		if (!isVariable.test(ch)) {
			if (ch === '.'){
				state.setClose(pos-1);

				return pos;
			} else /*if (ch === '[')*/ {
				return pos - 1;
			}
		}

		return null;
	}

	toToken(base: string, state: TokenizerState) {
		return new ValueToken(
			this.parser(base.substring(state.open, state.close)),
			state,
			{
				subType: this.subType
			}
		);
	}
}

export class BracketPattern {
	open(str: string, pos: number) {
		const ch = str[pos];

		if (ch === '[') {
			return new TokenizerState(pos);
		}

		return null;
	}

	close(str: string, pos: number, state: TokenizerState) {
		const ch = str[pos];

		if (ch === ']') {
			return pos;
		}

		return null;
	}

	toToken(base: string, state: TokenizerState) {
		return new ArrayToken(
			this.parser(base.substring(state.open, state.close)),
			state,
			{
				subType: this.subType
			}
		);
	}
}

export class Parser extends Compiler {
	constructor(){
		super({
			tokenizer: [
				new DotPattern(),
				new BracketPattern()
			],
			reducer: []
		})
	}
}
