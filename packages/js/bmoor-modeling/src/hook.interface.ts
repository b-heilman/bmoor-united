// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type HookFn<InputT = any, ResponseT = any, ArgsT = object> = (
	input: InputT,
	args: ArgsT,
) => ResponseT;

export type HookReference = string;

export interface HookInterface {
	onCreate?: HookFn;
	onRead?: HookFn;
	onUpdate?: HookFn;
	onInflate?: HookFn;
	onDeflate?: HookFn;
}
