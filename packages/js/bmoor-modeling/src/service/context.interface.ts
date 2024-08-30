import {ContextSecurityInterface} from '@bmoor/context';

import { EnvironmentContext } from '../environment/context';

export interface ServiceContextInterface extends ContextSecurityInterface {
	getEnv: () => EnvironmentContext
}