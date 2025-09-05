import {CompilerInterface} from './compiler.interface.ts';
import {Expressor} from './expressor.ts';
import {ExecutableFunction} from './expressor/executable.ts';
import {Reducer} from './reducer.ts';
import {StatementConstructor} from './reducer/statement.ts';
import {Tokenizer} from './tokenizer.ts';
import {Pattern} from './tokenizer/pattern.ts';
import {ExpressableToken} from './tokenizer/token.interface.ts';

export type CompilerSettings = {
	tokenizer: Pattern[];
	reducer: StatementConstructor[];
};

export class Compiler implements CompilerInterface {
	tokenizer: Tokenizer;
	reducer: Reducer;
	expressor: Expressor;

	constructor(settings: CompilerSettings) {
		this.tokenizer = new Tokenizer(settings.tokenizer);
		this.reducer = new Reducer(settings.reducer);
		this.expressor = new Expressor(this);
	}

	parse(str: string): ExpressableToken[] {
		return this.reducer.reduce(this.tokenizer.tokenize(str));
	}

	compile(str: string): ExecutableFunction {
		return this.expressor.makeExecutable(this.parse(str));
	}
}
