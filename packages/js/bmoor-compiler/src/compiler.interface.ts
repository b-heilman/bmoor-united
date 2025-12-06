import type {ExecutableFunction} from './expressor/executable.interface.ts';

export interface CompilerInterface {
	compile(str: string): ExecutableFunction;
}
