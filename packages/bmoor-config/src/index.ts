import {implode, MappedObject, DynamicObject} from '@bmoor/object';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ConfigValue = any;

export class ConfigObject<T> extends Object {
	constructor(settings: DynamicObject<T>) {
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
			skipInstanceOf: [ConfigObject, Config]
		});
	}

	get(
		path: string
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
						throw new Error('no mixing');
					}
				} else if (original instanceof ConfigObject) {
					if (val instanceof ConfigObject) {
						this.settings[path] = val;
					} else {
						throw new Error('no mixing');
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
