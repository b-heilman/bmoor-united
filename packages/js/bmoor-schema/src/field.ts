import {Path, PathInterface} from '@bmoor/path';

import {
	FieldInfo,
	FieldInterface,
	FieldJSON,
	FieldPathLink,
	FieldReference,
} from './field.interface';
import {TypingInterface} from './typing.interface';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export class Field<T = any> implements FieldInterface {
	source: FieldJSON;
	path: PathInterface<T>;

	constructor(schema: FieldJSON) {
		this.path = new Path(schema.path);
		this.source = schema;
	}

	getReference(): FieldReference {
		return this.source.ref;
	}

	getInfo(): FieldInfo {
		return this.source.info;
	}

	getPath(): string {
		return this.source.path;
	}

	getPathChain(): FieldPathLink[] {
		const chain = this.path.getChain();

		return chain.map((link) => {
			if (link.type === 'leaf') {
				return Object.assign(link, {
					fieldType: this.source.info.type,
				});
			} else {
				return link;
			}
		});
	}
}
