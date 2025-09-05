import {ContextSecurityInterface} from '@bmoor/context';

import {EnvironmentContext} from '../environment/context.ts';

export interface ServiceContextInterface extends ContextSecurityInterface {
	getEnv: () => EnvironmentContext;
}
