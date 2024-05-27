import {
	DatumInterface,
	DatumSelector,
	DatumSetterSettings,
	DatumSettings,
	FeatureValue,
} from './datum.interface';

export class Datum<SelectorT = DatumSelector> 
	implements DatumInterface<SelectorT> {
	ref: string;
	parent: Datum;
	children: Map<string, Datum>;
	awaiting: Map<string, Promise<unknown>>;
	features: Map<string, unknown>;
	metadata: Record<string, string>;

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

	getReference(): string {
		return this.ref;
	}

	getParent(): DatumInterface<SelectorT> {
		return this.parent;
	}

	getChildren(): Map<string, DatumInterface<SelectorT>> {
		return this.children;
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
		const select = Object.assign({}, selector);

		let base: Datum = null;

		if (select.parentMetadata) {
			let cur = this.parent;
			while (cur && !cur.matches(select.parentMetadata)) {
				cur = cur.parent;
			}

			base = cur;
		} else {
			base = this; // eslint-disable-line @typescript-eslint/no-this-alias
		}

		if (select.metadata) {
			if (base.matches(select.metadata)) {
				return [base];
			} else {
				return Array.from(base.children.values()).flatMap((child) => {
					select.parentMetadata = null;
					return child.select(select);
				});
			}
		} else {
			return [this];
		}
	}
}
