import {isString, isArray, isUndefined /*, isArrayLike*/} from '@bmoor/compare';

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

export function get(root, path: IncomingPathType) {
	var i,
		c,
		space,
		nextSpace,
		curSpace = root;

	if (!root) {
		return root;
	}

	space = parsePath(path);
	if (space.length) {
		for (i = 0, c = space.length; i < c; i++) {
			nextSpace = String(space[i]);

			if (
				nextSpace === '__proto__' ||
				nextSpace === 'constructor' ||
				nextSpace === 'prototype'
			) {
				return null;
			}

			if (isUndefined(curSpace[nextSpace])) {
				return;
			}

			curSpace = curSpace[nextSpace];
		}
	}

	return curSpace;
}

export function _makeGetter(property, next) {
	property = String(property);

	if (
		property === '__proto__' ||
		property === 'constructor' ||
		property === 'prototype'
	) {
		throw new Error('unable to access __proto__, constructor, prototype');
	}

	if (next) {
		return function getter(obj) {
			try {
				return next(obj[property]);
			} catch (ex) {
				return undefined;
			}
		};
	} else {
		return function getter(obj) {
			try {
				return obj[property];
			} catch (ex) {
				return undefined;
			}
		};
	}
}

export function makeGetter(path: IncomingPathType) {
	var i,
		fn,
		space = parsePath(path);

	if (space.length) {
		for (i = space.length - 1; i > -1; i--) {
			fn = _makeGetter(space[i], fn);
		}
	} else {
		return function (obj) {
			return obj;
		};
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

export function del(root, space: IncomingPathType) {
	var old,
		val,
		nextSpace,
		curSpace = root;

	if (space && (isString(space) || isArrayLike(space))) {
		space = parsePath(space);

		val = space.pop();

		for (var i = 0; i < space.length; i++) {
			nextSpace = space[i];

			if (isUndefined(curSpace[nextSpace])) {
				return;
			}

			curSpace = curSpace[nextSpace];
		}

		old = curSpace[val];
		delete curSpace[val];
	}

	return old;
}
**/
