import {TypingReference} from './typing.interface';

export type ConnectionReference = string;
export type ConnectionActionsType = Record<string, TypingReference>;

export interface ConnectionSelect<ActionsT extends ConnectionActionsType> {
	actions?: ActionsT;
}

export type ConnectionFn<
	ActionsT extends ConnectionActionsType = ConnectionActionsType,
> = (select: ConnectionSelect<ActionsT>) => Promise<any[]>; // eslint-disable-line  @typescript-eslint/no-explicit-any

export interface ConnectionJSON<ActionsT extends ConnectionActionsType> {
	reference: ConnectionReference;
	actions?: ActionsT;
}
