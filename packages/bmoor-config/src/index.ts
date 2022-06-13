import {implode, MappedObject, DynamicObject} from '@bmoor/object';

export type ConfigValue = string | number | boolean;

export class ConfigObject<T> extends Object {
	constructor(settings: DynamicObject<T>) {
		super();

		if (settings) {
			Object.assign(this, settings);
		}
	}
}

export class Config<T> {
	settings: MappedObject<T | Config<T> | ConfigObject<T>>;

	constructor(settings: DynamicObject<T | ConfigObject<T> | Config<T>>) {
		this.settings = implode(settings, {
			skipInstanceOf: [ConfigObject, Config]
		});
	}

	get(path: string): T | Config<T> | ConfigObject<T> {
		return this.settings[path];
	}

	merge(primary: Config<T>) {
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

	override(settings: DynamicObject<T | ConfigObject<T> | Config<T>>) {
		const newConfig = new Config<T>(settings);

		newConfig.merge(this);

		return newConfig;
	}
}

export function create<T>(settings: DynamicObject<T>) {
	return new Config<T>(settings);
}
