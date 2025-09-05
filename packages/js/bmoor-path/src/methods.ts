import {isArray, isObject} from '@bmoor/compare';
import {DynamicObject, ImplodeSettings, MappedObject} from '@bmoor/object';
import {IgnoreSettings} from '@bmoor/object/src/object.interface.ts';

import {Path} from './path.ts';

function connectPath(key: string, next: string = null): string {
	if (next) {
		if (next[0] === '[') {
			return key + next;
		} else {
			return key + '.' + next;
		}
	} else {
		return key;
	}
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function implode<T = any>(
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	source: any,
	settings: ImplodeSettings = {},
): MappedObject<T> {
	const rtn = <MappedObject<T>>{};

	let ignore = <IgnoreSettings>{};
	if (settings.ignore) {
		ignore = settings.ignore;
	}

	let format = null;

	if (isArray(source)) {
		let fn = connectPath;
		while (isArray(source)) {
			const old = fn;
			fn = function (key: string, next: string = null) {
				return connectPath('[]', old(key, next));
			};
			source = source[0];
		}

		format = fn;
	} else {
		format = connectPath;
	}

	if (isObject(source)) {
		for (const key in source) {
			const val = source[key];
			const t = ignore[key];

			if (t !== true) {
				if (
					isObject(val) &&
					(!settings.skipInstanceOf ||
						// eslint-disable-next-line  @typescript-eslint/no-explicit-any
						!settings.skipInstanceOf.reduce((agg: boolean, type: any) => {
							if (agg) {
								return true;
							} else {
								return val instanceof type;
							}
						}, false))
				) {
					const todo = implode(
						val,
						Object.assign({}, settings, {ignore: t}),
					);

					for (const k in todo) {
						rtn[format(key, k)] = <T>todo[k];
					}
				} else {
					rtn[format(key)] = <T>val;
				}
			}
		}
	} else {
		rtn[format('')] = source;
	}

	return rtn;
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function explode<T = any>(
	mappings: MappedObject<T>,
	target: DynamicObject<T> = null,
): DynamicObject<T> {
	if (!target) {
		target = <DynamicObject<T>>{};
	}

	for (const key in mappings) {
		const path = new Path(key);

		path.write(target, mappings[key]);
	}

	return target;
}
