
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
			//	subType: this.subType
			}
		);
	}
}

class BracketState extends TokenizerState {
	isQuote: boolean;

	constructor(begin: number, isQuote: boolean = false){
		super(begin);

		this.isQuote = isQuote;		
	}
}

export class BracketPattern {
	open(str: string, pos: number) {
		const ch = str[pos];

		if (ch === '[') {
			const next = str[pos+1];

			if (next === '"'){
				return new BracketState(pos+2, true);
			} else {
				return new BracketState(pos+1);
			}
		}

		return null;
	}

	close(str: string, pos: number, state: BracketState) {
		const ch = str[pos];

		if (ch === ']') {
			if (state.isQuote){
				const prev = str[pos-1];

				if (prev === '"'){
					state.setClose(pos-2);

					return pos+1;
				}
			} else {
				state.setClose(pos-1);

				return pos+1;
			}
		}

		return null;
	}

	toToken(base: string, state: BracketState) {
		if (state.isQuote){
			return new ValueToken(
				this.parser(base.substring(state.open, state.close)),
				state,
				{
				// 	subType: this.subType
				}
			);
		} else {
			return new ArrayToken(
				this.parser(base.substring(state.open, state.close)),
				state,
				{
					subType: 'object'
				}
			);
		}
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
