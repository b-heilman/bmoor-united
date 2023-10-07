import {
	DatumInterface,
	DatumSelector,
	DatumSettings,
} from './datum.interface';

export class Datum implements DatumInterface<DatumSelector> {
	ref: string;
	features: Map<string, number>;
	metadata: Record<string, string>;
	children: Map<string, Datum>;

	constructor(ref: string, settings: DatumSettings) {
		this.ref = ref;
		this.features = new Map();

		for (const key in settings.features) {
			this.features.set(key, settings.features[key]);
		}

		this.metadata = settings.metadata || {};

		this.children = new Map();
		if (settings.children) {
			for (const childRef in settings.children) {
				const childSettings = settings.children[childRef];

				this.children.set(childRef, new Datum(childRef, childSettings));
			}
		}
	}

	matches(metadata: Record<string, string>) {
		for (const key in metadata) {
			if (
				!(key in this.metadata && this.metadata[key] === metadata[key])
			) {
				return false;
			}
		}

		return true;
	}

	hasValue(attr: string) {
		return this.features.has(attr);
	}

	async getValue(attr: string) {
		return this.features.get(attr);
	}

	async setValue(attr: string, value: number) {
		this.features.set(attr, value);

		return true;
	}

	select(selector: DatumSelector) {
		if (selector.metadata) {
			if (this.matches(selector.metadata)) {
				return [this];
			} else {
				return Array.from(this.children.values()).flatMap((child) =>
					child.select(selector),
				);
			}
		} else {
			return [this];
		}
	}
}
