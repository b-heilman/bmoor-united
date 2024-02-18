export class CollectionMap<Tag, Node> {
	index: Map<Tag, Node[]>;

	constructor() {
		this.index = new Map();
	}

	add(tags: Tag[] = [], node: Node) {
		for (const tag of tags) {
			if (this.index.has(tag)) {
				this.index.get(tag).push(node);
			} else {
				this.index.set(tag, [node]);
			}
		}
	}

	has(tag: Tag) {
		return this.index.has(tag);
	}

	get(tag: Tag): Node[] {
		return this.index.get(tag) || [];
	}

	keys(): Tag[] {
		return Array.from(this.index.keys());
	}
}
