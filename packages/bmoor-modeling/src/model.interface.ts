import {ContextInterface} from '@bmoor/context';

export interface ModelSecurity {
	secure(ctx: ContextInterface);
}

export interface ModelSettings {
	security: ModelSecurity;
}
