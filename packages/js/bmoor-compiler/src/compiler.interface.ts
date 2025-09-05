import {ExecutableFunction} from './expressor/executable.ts';

export interface CompilerInterface {
	compile(str: string): ExecutableFunction;
}
