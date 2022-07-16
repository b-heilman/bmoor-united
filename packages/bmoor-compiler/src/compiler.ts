import {Tokenizer} from './tokenizer';
import {Pattern} from './tokenizer/pattern';
import {ExpressableToken} from './tokenizer/token';
import {Reducer} from './reducer';
import {StatementConstructor} from './reducer/statement';
import {Expressor} from './expressor';
import {ExecutableFunction} from './expressor/executable';
import {CompilerInterface} from './compiler.interface';

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
