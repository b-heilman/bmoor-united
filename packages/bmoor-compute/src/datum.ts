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
	parent: Datum;

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

				const datum = new Datum(childRef, childSettings);
				this.children.set(childRef, datum);

				datum.parent = this;
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
		const clone = Object.assign({}, selector);

		let base: Datum = null;

		if (clone.parent) {
			let cur = this.parent;
			while (cur && !cur.matches(clone.parent)) {
				cur = cur.parent;
				console.log(cur);
			}

			base = cur;
		} else {
			base = this; // eslint-disable-line @typescript-eslint/no-this-alias
		}

		if (clone.metadata) {
			if (base.matches(clone.metadata)) {
				return [base];
			} else {
				return Array.from(base.children.values()).flatMap((child) => {
					clone.parent = null;
					return child.select(clone);
				});
			}
		} else {
			return [this];
		}
	}
}
