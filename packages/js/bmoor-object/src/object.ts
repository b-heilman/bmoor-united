import {isArray, isObject, isString, isUndefined} from '@bmoor/compare';
import {create} from '@bmoor/error';

import {IgnoreSettings, ImplodeSettings} from './object.interface';

export type ParsedPathType = Array<string>;
export type IncomingPathType = string | ParsedPathType;

export function parsePath(path: IncomingPathType): ParsedPathType {
	if (!path) {
		return [];
	} else if (isString(path)) {
		const asString = <string>path;
		// this isn't perfect, I'm making it work with arrays though
		if (asString.indexOf('[') !== -1) {
			return asString.match(/[^\][.]+/g).map((d) => {
				if (d[0] === '"' || d[0] === "'") {
					return d.substring(1, d.length - 1);
				} else {
					return d;
				}
			});
		} else {
			return asString.split('.');
		}
	} else if (isArray(path)) {
		const asArray = <Array<string>>path;

		return asArray.slice(0);
	} else {
		throw create('unable to parse path', {
			code: 'BM_OB_PATH',
			context: {
				path,
				type: typeof path,
			},
		});
	}
}

// base functionality does not support arrays
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type DynamicObject<T = any> = {
	[key: string]: T | DynamicObject<T> | DynamicObject<T>[];
};

/**
 * Sets a value to a namespace, returns the old value
 *
 * @function set
 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
 * @param {string|array} space The namespace
 * @param {*} value The value to set the namespace to
 * @return {*}
 **/
export function set<T>(
	root: DynamicObject<T>,
	space: IncomingPathType,
	value: T,
): DynamicObject<T> {
	const path = parsePath(space);
	const val = path.pop();

	let curSpace = root;

	for (let i = 0, c = path.length; i < c; i++) {
		const nextSpace = path[i];

		if (
			nextSpace === '__proto__' ||
			nextSpace === 'constructor' ||
			nextSpace === 'prototype'
		) {
			return null;
		}

		if (isUndefined(curSpace[nextSpace])) {
			curSpace[nextSpace] = <DynamicObject<T>>{};
		}

		curSpace = <DynamicObject<T>>curSpace[nextSpace];
	}

	curSpace[val] = value;

	return curSpace;
}

// https://www.typescriptlang.org/docs/handbook/2/functions.html
export type SetterFn<T> = (
	root: DynamicObject<T>,
	value: T,
) => DynamicObject<T>;

function _makeSetter<T>(property: string, next: SetterFn<T>): SetterFn<T> {
	property = String(property);

	if (
		property === '__proto__' ||
		property === 'constructor' ||
		property === 'prototype'
	) {
		throw create('unable to access __proto__, constructor, prototype', {
			code: 'BM_OB_MAKESETTER',
		});
	}

	if (next) {
		return function setter(
			root: DynamicObject<T>,
			value: T,
		): DynamicObject<T> {
			let t = <DynamicObject<T>>root[property];

			if (!t) {
				t = root[property] = <DynamicObject<T>>{};
			}

			return next(t, value);
		};
	} else {
		return function (root: DynamicObject<T>, value: T): DynamicObject<T> {
			root[property] = value;
			return root;
		};
	}
}

export function makeSetter<T>(space: IncomingPathType): SetterFn<T> {
	const path = parsePath(space);

	let fn = null;

	for (let i = path.length - 1; i > -1; i--) {
		fn = _makeSetter<T>(path[i], fn);
	}

	return fn;
}

/**
 * get a value from a namespace, if it doesn't exist, the path will be created
 *
 * @function get
 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
 * @param {string|array|function} space The namespace
 * @return {array}
 **/
export function get<T>(root: DynamicObject<T>, path: IncomingPathType): T {
	const space = parsePath(path);

	let curSpace = root;
	let rtnValue = null;
	let nextSpace = null;

	for (let i = 0, c = space.length - 1; i <= c; i++) {
		nextSpace = space[i];

		if (
			nextSpace === '__proto__' ||
			nextSpace === 'constructor' ||
			nextSpace === 'prototype'
		) {
			i = c;
			continue;
		}

		if (nextSpace in curSpace) {
			if (i === c) {
				rtnValue = <T>curSpace[nextSpace];
			} else {
				curSpace = <DynamicObject<T>>curSpace[nextSpace];
			}
		} else {
			i = c;
			continue;
		}
	}

	return rtnValue;
}

export type GetterFn<T> = (root: DynamicObject<T>) => T;

function _makeGetter<T>(property: string, next: GetterFn<T>): GetterFn<T> {
	if (
		property === '__proto__' ||
		property === 'constructor' ||
		property === 'prototype'
	) {
		throw create('unable to access __proto__, constructor, prototype', {
			code: 'BM_OB_MAKEGETTER',
		});
	}

	if (next) {
		return function getter(obj: DynamicObject<T>): T {
			try {
				return next(<DynamicObject<T>>obj[property]);
			} catch (ex) {
				return undefined;
			}
		};
	} else {
		return function getter(obj: DynamicObject<T>): T {
			try {
				return <T>obj[property];
			} catch (ex) {
				return undefined;
			}
		};
	}
}

export function makeGetter<T>(path: IncomingPathType): GetterFn<T> {
	const space = parsePath(path);

	let fn = null;

	// if space.length === 0, fn is still null
	for (let i = space.length - 1; i > -1; i--) {
		fn = _makeGetter<T>(space[i], fn);
	}

	return fn;
}

/**
 * Delete a namespace, returns the old value
 *
 * @function del
 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
 * @param {string|array} space The namespace
 * @return {*}
 **/

export function del<T>(root: DynamicObject<T>, path: IncomingPathType): T {
	const space = parsePath(path);

	let curSpace = root;
	let rtnValue = null;
	let nextSpace = null;

	for (let i = 0, c = space.length - 1; !rtnValue; i++) {
		nextSpace = space[i];

		if (nextSpace in curSpace) {
			if (i === c) {
				rtnValue = <T>curSpace[nextSpace];
				delete curSpace[nextSpace];
			} else {
				curSpace = <DynamicObject<T>>curSpace[nextSpace];
			}
		} else {
			return null;
		}
	}

	return rtnValue;
}

/**
 * Takes a hash and uses the indexs as namespaces to add properties to an objs
 *
 * @function explode
 * @param {object} target The object to map the variables onto
 * @param {object} mappings An object orientended as [ namespace ] => value
 * @return {object} The object that has had content mapped into it
 **/
export type MappedObject<T> = {[key: string]: T};

export function explode<T>(
	mappings: MappedObject<T>,
	target: DynamicObject<T> = null,
): DynamicObject<T> {
	if (!target) {
		target = <DynamicObject<T>>{};
	}

	for (const key in mappings) {
		set<T>(<DynamicObject<T>>target, key, mappings[key]);
	}

	return target;
}

export function implode<T>(
	obj: DynamicObject<T>,
	settings: ImplodeSettings = {},
): MappedObject<T> {
	const rtn = <MappedObject<T>>{};

	let ignore = <IgnoreSettings>{};
	if (settings.ignore) {
		ignore = settings.ignore;
	}

	let format = null;

	if (isArray(obj)) {
		// array support will go into path operators
		throw create('unable to process arrays', {
			code: 'BM_OB_IMPLODE_1',
		});
	} else {
		format = function fn2(key: string, next: string = null): string {
			if (next) {
				if (next[0] === '[') {
					return key + next;
				} else {
					return key + '.' + next;
				}
			} else {
				return key;
			}
		};
	}

	for (const key in obj) {
		const val = obj[key];
		const t = ignore[key];

		if (t !== true) {
			if (isArray(val)) {
				throw create('unable to process arrays', {
					code: 'BM_OB_IMPLODE_2',
				});
			} else if (
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
					<MappedObject<T>>val,
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

	return rtn;
}

// Pulls out all the paths of the object.  There are places where Object.keys(implode) are being run, this should be
// much more efficient
export function keys<T>(
	obj: DynamicObject<T>,
	settings: ImplodeSettings = {},
): string[] {
	let rtn = [];

	let ignore = <IgnoreSettings>{};
	if (settings.ignore) {
		ignore = settings.ignore;
	}

	let format = null;

	if (isArray(obj)) {
		// array support will go into path operators
		throw create('unable to process arrays', {
			code: 'BM_OB_IMPLODE_1',
		});
	} else {
		format = function fn2(key: string, next: string = null): string {
			if (next) {
				if (next[0] === '[') {
					return key + next;
				} else {
					return key + '.' + next;
				}
			} else {
				return key;
			}
		};
	}

	for (const key in obj) {
		const val = obj[key];
		const t = ignore[key];

		if (t !== true) {
			if (isArray(val)) {
				throw create('unable to process arrays', {
					code: 'BM_OB_IMPLODE_2',
				});
			} else if (
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
				const subs = keys(
					<MappedObject<T>>val,
					Object.assign({}, settings, {ignore: t}),
				);

				rtn = rtn.concat(subs.map((sub) => format(key, sub)));
			} else {
				rtn.push(format(key));
			}
		}
	}

	return rtn;
}

export function merge<T>(
	to: DynamicObject<T>,
	...args: DynamicObject<T>[]
): DynamicObject<T> {
	for (let i = 0, c = args.length; i < c; i++) {
		const from = args[i];

		if (to === from) {
			continue;
		} else if (isArray(from)) {
			throw create('unable to process arrays', {
				code: 'BM_OB_MERGE_ARRAY',
			});
		} else if (!isObject(from)) {
			// only to is an objects
			to = from;
		} else if (!isObject(to)) {
			// only from is an object
			to = merge({}, from);
		} else {
			// both from and to are objects
			for (const key in from) {
				const val = <DynamicObject<T>>from[key];

				if (isObject(val)) {
					to[key] = merge(<DynamicObject<T>>to[key], val);
				} else {
					to[key] = val;
				}
			}
		}
	}

	return to;
}

export function equals<T>(
	cur: Record<string, T>,
	comp: Record<string, T>,
	deep = false,
) {
	const curKeys = Object.keys(cur);
	const compKeys = Object.keys(comp);

	if (curKeys.length !== compKeys.length) {
		return false;
	}

	for (let i = 0, c = curKeys.length; i < c; i++) {
		if (curKeys[i] !== compKeys[i]) {
			return false;
		}
	}

	if (deep) {
		for (let i = 0, c = curKeys.length; i < c; i++) {
			const key = curKeys[i];
			const val = cur[key];
			const other = comp[key];
			if (val !== comp[key]) {
				if (
					!(
						typeof val === 'object' &&
						typeof other === 'object' &&
						equals<T>(
							<Record<string, T>>val,
							<Record<string, T>>other,
							deep,
						)
					)
				) {
					return false;
				}
			}
		}
	} else {
		for (let i = 0, c = curKeys.length; i < c; i++) {
			const key = curKeys[i];
			if (cur[key] !== comp[key]) {
				return false;
			}
		}
	}

	return true;
}
