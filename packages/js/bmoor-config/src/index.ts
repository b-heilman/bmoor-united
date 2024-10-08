import {create as createError} from '@bmoor/error';
import {DynamicObject, MappedObject, implode} from '@bmoor/object';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ConfigValue = any;

export class ConfigObject<T> extends Object {
	constructor(settings: T) {
		super();

		if (settings) {
			Object.assign(this, settings);
		}
	}
}

export class Config<I> {
	settings: MappedObject<
		ConfigValue | Config<ConfigValue> | ConfigObject<ConfigValue>
	>;

	constructor(settings: I) {
		this.settings = implode(<DynamicObject<ConfigValue>>settings, {
			skipInstanceOf: [ConfigObject, Config],
		});
	}

	get(
		path: string,
	): ConfigValue | Config<ConfigValue> | ConfigObject<ConfigValue> {
		return this.settings[path];
	}

	merge(primary: Config<I>) {
		for (const path in primary.settings) {
			const original = primary.settings[path];

			if (path in this.settings) {
				const val = this.settings[path];

				if (original instanceof Config) {
					if (val instanceof Config) {
						val.merge(original);
					} else {
						throw createError('no mixing', {
							code: 'BM_CFG_MIX_1',
						});
					}
				} else if (original instanceof ConfigObject) {
					if (val instanceof ConfigObject) {
						this.settings[path] = val;
					} else {
						throw createError('no mixing', {
							code: 'BM_CFG_MIX_2',
						});
					}
				} else {
					// nothing needs to be done
					// this.settings[path] = original;
				}
			} else {
				this.settings[path] = original;
			}
		}
	}

	override(settings: I) {
		const newConfig = new Config<I>(settings);

		newConfig.merge(this);

		return newConfig;
	}
}

export function create<I>(settings: I) {
	return new Config<I>(settings);
}
