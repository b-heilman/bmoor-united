import {HookInterface, HookReference} from './hook.interface.ts';

export interface HookerInterface {
	define(hooks: Record<HookReference, HookInterface>);
	addHook(name: HookReference, info: HookInterface): void;
	getHook(name: HookReference): HookInterface;
}
