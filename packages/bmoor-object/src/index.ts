import {isString, isArray, isUndefined, isArrayLike} from '@bmoor/compare';

export function parsePath(path: string | Array<string>): Array<string> {
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

/**
 * Sets a value to a namespace, returns the old value
 *
 * @function set
 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
 * @param {string|array} space The namespace
 * @param {*} value The value to set the namespace to
 * @return {*}
 **/
export function set(root, space, value) {
	var i,
		c,
		val,
		nextSpace,
		curSpace = root;

	space = parsePath(space);

	val = space.pop();

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
			curSpace[nextSpace] = {};
		}

		curSpace = curSpace[nextSpace];
	}

	curSpace[val] = value;

	return curSpace;
}

export function _makeSetter(property, next) {
	property = String(property);

	if (
		property === '__proto__' ||
		property === 'constructor' ||
		property === 'prototype'
	) {
		throw new Error('unable to access __proto__, constructor, prototype');
	}

	if (next) {
		return function setter(ctx, value) {
			var t = ctx[property];

			if (!t) {
				t = ctx[property] = {};
			}

			return next(t, value);
		};
	} else {
		return function (ctx, value) {
			ctx[property] = value;
			return ctx;
		};
	}
}

export function makeSetter(space) {
	var i,
		fn,
		readings = parsePath(space);

	for (i = readings.length - 1; i > -1; i--) {
		fn = _makeSetter(readings[i], fn);
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
export function get(root, path) {
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

export function makeGetter(path) {
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
 **/
export function del(root, space) {
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
