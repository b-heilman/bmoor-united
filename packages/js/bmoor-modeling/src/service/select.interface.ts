import {TypingReference} from '@bmoor/schema';

import {RequestParameters} from '../request.interface.ts';

export type ServiceSelectActionType = string;
export type ServiceSelectActionCommand = string;

export type ServiceSelectActionsType = Record<
	ServiceSelectActionType,
	ServiceSelectActionCommand
>;

export type ServiceSelectType = {
	params?: RequestParameters;
	actions?: ServiceSelectActionsType;
};

export type ServiceSelectSettings = Record<
	ServiceSelectActionType,
	{
		type: TypingReference;
		fn?: (input: unknown[], cmd: ServiceSelectActionCommand) => unknown[];
		isAllowed?: (cmd: ServiceSelectActionCommand) => boolean;
	}
>;
