import {ContextualError, InvocationContext} from '@bmoor/error';

export const SILENT = Symbol('isSilent');
export const ERROR = Symbol('isError');
export const WARN = Symbol('isWarning');
export const INFO = Symbol('isInfo');
export const VERBOSE = Symbol('isVerbose');

export interface LogInfo {
	message: string;
	timestamp?: number;
	error?: ContextualError;
	invocation?: InvocationContext;
}

export interface LoggingConfigInterface {
	write?: (type: symbol, info: LogInfo) => Promise<void>;
	level?: symbol;
}
