import {ExecutableFunction} from './expressor/executable';

export interface CompilerInterface {
	compile(str: string): ExecutableFunction;
}
