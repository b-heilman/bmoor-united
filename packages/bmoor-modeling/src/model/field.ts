import {Config, ConfigObject} from '@bmoor/config';

import {
	ModelFieldInterface,
	ModelFieldSettings,
	ModelFieldUsage,
	ModelFieldTypescript
} from './field.interface';

export const usages = new Config({
	json: new ConfigObject<ModelFieldUsage>({
		onInflate: function (datum, setter, getter) {
			const value = getter(datum);

			if (value) {
				setter(datum, JSON.parse(value));
			}
		},
		onDeflate: function (datum, setter, getter) {
			const value = getter(datum);

			if (value) {
				setter(datum, JSON.stringify(value));
			}
		}
	}),
	monitor: new ConfigObject<ModelFieldUsage>({
		onCreate: function (datum, setter, getter, cfg) {
			const target = cfg.getTarget(datum);

			if (target !== undefined) {
				setter(datum, Date.now());
			}
		},
		onUpdate: function (datum, setter, getter, cfg) {
			const target = cfg.getTarget(datum);

			if (target !== undefined) {
				setter(datum, Date.now());
			}
		}
	})
});

export class ModelField implements ModelFieldInterface {
	incomingSettings: ModelFieldSettings;

	constructor(settings: ModelFieldSettings) {
		if (!settings.internal) {
			settings.internal = settings.external;
		}

		this.incomingSettings = settings;
	}

	toTypescript(): ModelFieldTypescript {
		return {
			internal: {
				path: '',
				format: ''
			},
			external: {
				path: '',
				format: ''
			}
		};
	}
}
