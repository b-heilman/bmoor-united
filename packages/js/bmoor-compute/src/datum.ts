import {
	DatumSelector,
	DatumSetterSettings,
	DatumSettings,
	FeatureValue,
	IDatum,
} from './datum.interface';

export class Datum implements IDatum {
	ref: string;
	awaiting: Map<string, Promise<unknown>>;
	features: Map<string, unknown>;
	metadata: Record<string, string>;
	children: Map<string, Datum>;
	parent: Datum;

	constructor(ref: string, settings: DatumSettings) {
		this.ref = ref;
		this.awaiting = new Map();
		this.features = new Map();

		this.build(settings);
	}

	build(settings: DatumSettings) {
		for (const key in settings.features) {
			this.features.set(key, settings.features[key]);
		}

		this.metadata = settings.metadata || {};

		this.children = new Map();
		if (settings.children) {
			for (const childRef in settings.children) {
				this.createChild(childRef, settings.children[childRef]);
			}
		}
	}

	createChild(name, settings) {
		const child = new Datum(name, settings);

		this.addChild(child);

		return child;
	}

	equals(other: Datum) {
		return this === other;
	}

	addChild(child: Datum) {
		this.children.set(child.ref, child);

		child.parent = this;
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
		return this.features.has(attr) || this.awaiting.has(attr);
	}

	async getValue(
		attr: string,
		generator: () => Promise<FeatureValue>,
		settings: DatumSetterSettings = {},
	): Promise<FeatureValue> {
		if (this.awaiting.has(attr)) {
			return <Promise<FeatureValue>>this.awaiting.get(attr);
		} else if (this.features.has(attr)) {
			return <FeatureValue>this.features.get(attr);
		} else {
			const rtn = generator();

			rtn.then((val) => {
				this.awaiting.delete(attr);

				if (!settings.fake) {
					this.features.set(attr, val);
				}

				return val;
			});

			this.awaiting.set(attr, rtn);

			return rtn;
		}
	}

	async setValue(attr: string, value: FeatureValue) {
		if (this.awaiting.has(attr)) {
			this.awaiting.delete(attr);
		}

		this.features.set(attr, value);

		return true;
	}

	select(selector: DatumSelector): Datum[] {
		const clone = Object.assign({}, selector);

		let base: Datum = null;

		if (clone.parent) {
			let cur = this.parent;
			while (cur && !cur.matches(clone.parent)) {
				cur = cur.parent;
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
