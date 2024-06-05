import {DynamicObject} from '@bmoor/object';
import {Path, PathInterface} from '@bmoor/path';

import {ContextInterface} from './context.interface';
import {
	FieldInfo,
	FieldInterface,
	FieldJSON,
	FieldPathLink,
	FieldReference,
} from './field.interface';
import {ValidatorJSON} from './validator.interface';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export class Field<T = any> implements FieldInterface {
	source: FieldJSON;
	path: PathInterface<T>;
	validation: ValidatorJSON;

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

	read(root: DynamicObject<T>): T {
		return this.path.read(root);
	}

	write(root: DynamicObject<T>, v: T): void {
		return this.path.write(root, v);
	}

	setValidator(settings: ValidatorJSON) {
		this.validation = settings;
	}

	validate(
		ctx: ContextInterface,
		root: DynamicObject<T>,
	): Promise<string> {
		const validator = ctx.getValidator(this.validation.validator);
		return validator(this.read(root));
	}
}
