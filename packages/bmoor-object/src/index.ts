import {isString, isArray, isUndefined} from '@bmoor/compare';

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
		throw new Error('unable to parse path: ' + path + ' : ' + typeof path);
	}
}

export type DynamicObject<T> = {[key: string]: T | DynamicObject<T>};

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
	value: T
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
type SetterFn<T> = (root: DynamicObject<T>, value: T) => DynamicObject<T>;

export function _makeSetter<T>(
	property: string,
	next: SetterFn<T>
): SetterFn<T> {
	property = String(property);

	if (
		property === '__proto__' ||
		property === 'constructor' ||
		property === 'prototype'
	) {
		throw new Error('unable to access __proto__, constructor, prototype');
	}

	if (next) {
		return function setter(root: DynamicObject<T>, value: T): DynamicObject<T> {
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

	for (let i = 0, c = space.length - 1; !rtnValue; i++) {
		nextSpace = space[i];

		if (
			nextSpace === '__proto__' ||
			nextSpace === 'constructor' ||
			nextSpace === 'prototype'
		) {
			return rtnValue;
		}

		if (nextSpace in curSpace) {
			if (i === c) {
				rtnValue = <T>curSpace[nextSpace];
			} else {
				curSpace = <DynamicObject<T>>curSpace[nextSpace];
			}
		} else {
			return null;
		}
	}

	return rtnValue;
}

type GetterFn<T> = (root: DynamicObject<T>) => T;

export function _makeGetter<T>(
	property: string,
	next: GetterFn<T>
): GetterFn<T> {
	if (
		property === '__proto__' ||
		property === 'constructor' ||
		property === 'prototype'
	) {
		throw new Error('unable to access __proto__, constructor, prototype');
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
	target: DynamicObject<T> = null
): <DynamicObject<T>> {
	if (!target) {
		target = <DynamicObject<T>>{};
	}

	for (const key in mappings) {
		set<T>(target, key, mappings[key]);
	}

	return target;
}

/*
function implode(obj, settings = {}) {
	var rtn = {};

	let ignore = {};
	if (settings.ignore) {
		ignore = settings.ignore;
	}

	let format = null;

	if (bmoor.isArray(obj)) {
		format = function fn1(key, next) {
			if (next) {
				if (next[0] === '[') {
					return '[' + key + ']' + next;
				} else {
					return '[' + key + '].' + next;
				}
			} else {
				return '[' + key + ']';
			}
		};
	} else {
		format = function fn2(key, next) {
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
			if (settings.skipArray && bmoor.isArray(val)) {
				rtn[format(key)] = val;
			} else if (
				bmoor.isObject(val) &&
				!(val instanceof Symbol) &&
				(!settings.instanceOf || !(val instanceof settings.instanceOf))
			) {
				const todo = implode(val, Object.assign({}, settings, {ignore: t}));

				for (const k in todo) {
					rtn[format(key, k)] = todo[k];
				}
			} else {
				rtn[format(key)] = val;
			}
		}
	}

	return rtn;
}

*/
