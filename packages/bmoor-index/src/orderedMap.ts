// I'm putthing this here for now since I'm lazy.
// It'll go to its own file when I add more index algorithms

export class OrderedMap<Tag, Node> {
	tags: Tag[];
	index: Map<Tag, Node>;
	tagPos: Map<Tag, number>;

	constructor() {
		this.index = new Map();
		this.tags = [];
		this.tagPos = new Map();
	}

	setNode(tag: Tag, node: Node) {
		this.index.set(tag, node);

		const pos = this.tags.length;

		this.tags.push(tag);
		this.tagPos.set(tag, pos);
	}

	getNode(tag: Tag): Node {
		return this.index.get(tag);
	}

	hasNode(tag: Tag): boolean {
		return this.index.has(tag);
	}

	setTagOrder(tags: Tag[]) {
		this.tags = tags;
		this.tagPos = new Map();

		const c = tags.length;
		for (let i = 0; i < c; i++) {
			this.tagPos.set(tags[i], i);
		}
	}

	getTagsBetween(start: Tag, stop: Tag): Tag[] {
		const begin = this.tagPos.get(start);
		let end = this.tagPos.get(stop);

		const rtn = [];

		if (begin > end) {
			end = end - 1;
			for (let i = begin; i > end; i--) {
				rtn.push(this.tags[i]);
			}
		} else {
			end = end + 1;
			for (let i = begin; i < end; i++) {
				rtn.push(this.tags[i]);
			}
		}

		return rtn;
	}

	getNodesBetween(start: Tag, stop: Tag): Map<Tag, Node> {
		return this.getTagsBetween(start, stop).reduce((agg, tag) => {
			agg.set(tag, this.getNode(tag));
			return agg;
		}, new Map());
	}

	// for this, I assume 0 -> 15, so offset 1 takes you back
	// in time.  This is why it's now - 1, so offset a positive number
	// is the default
	getTagOffset(start: Tag, offset: number, doBest = false): Tag {
		const begin = this.tagPos.get(start);
		const next = begin + offset;

		if (doBest) {
			if (next < 0) {
				return this.tags[0];
			} else if (next >= this.tags.length) {
				return this.tags[this.tags.length - 1];
			}
		}

		return this.tags[next];
	}
}
