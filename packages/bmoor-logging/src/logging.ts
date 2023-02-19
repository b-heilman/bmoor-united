import {Config} from '@bmoor/config';
import {ContextualError, InvocationContext, wrapError} from '@bmoor/error';

import {
	ERROR,
	INFO,
	LogInfo,
	LoggingConfigInterface,
	SILENT,
	VERBOSE,
	WARN,
} from './logging.interface';

const levels = {
	[SILENT]: {
		name: 'silent',
		rank: 4,
	},
	[ERROR]: {
		name: 'error',
		rank: 3,
	},
	[WARN]: {
		name: 'warn',
		rank: 2,
	},
	[INFO]: {
		name: 'info',
		rank: 1,
	},
	[VERBOSE]: {
		name: 'verbose',
		rank: 0,
	},
};

const config = new Config<LoggingConfigInterface>({
	write: async function (type: symbol, info: LogInfo) {
		const message = info.message;
		const timestamp = info.timestamp || Date.now();
		const dump = {};

		if (info.error) {
			Object.assign(dump, info.error.toJSON());
		}

		if (info.invocation) {
			Object.assign(dump, info.invocation);
		}

		console.log(`(${timestamp}) -> ${levels[type].name} : ${message}`);

		if (Object.keys(dump).length) {
			console.log(JSON.stringify(dump, null, '\t'));
		}
	},
	level: ERROR,
});

export class Logging {
	config: Config<LoggingConfigInterface>;

	constructor(settings: LoggingConfigInterface = {}) {
		this.config = config.override(settings);
	}

	async log(logInfo: LogInfo, onLevel: symbol = WARN) {
		const level = levels[onLevel];

		if (levels[this.config.get('level')].rank <= level.rank) {
			return this.config.get('write')(onLevel, logInfo);
		}
	}

	async report(error: Error | ContextualError, onLevel: symbol = ERROR) {
		const wrapped = wrapError(error);

		return this.log(
			{
				message: wrapped.parent.message,
				error: wrapped,
				invocation: wrapped.invocation,
			},
			onLevel,
		);
	}

	async comment(
		msg: string,
		invocation: InvocationContext = null,
		onLevel: symbol = INFO,
	) {
		return this.log(
			{
				message: msg,
				invocation,
			},
			onLevel,
		);
	}
}
