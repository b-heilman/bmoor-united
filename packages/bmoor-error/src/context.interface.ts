// This should be defined in the code
export interface ErrorContext {
	code: string;
	response?: string;
	status?: number;
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	context?: any;
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	protected?: any;
}

// This should be set in a controller
export interface InvocationContext {
	requestId: string;
	method: string;
	userId?: string;
}
