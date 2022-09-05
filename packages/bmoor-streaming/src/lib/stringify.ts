import { Readable, Writable } from 'stream';

import {Batched} from '../transformation/batch';

// specializes in converting a stream into a string.     It is assumed that a stream
// will always be respresented by an array in the resulting json object
async function encode(incoming: Readable, write, flush = null): Promise<void> {
	return new Promise(function (resolve, reject) {
		let first = true;
		try {
			const stream = new Writable({
				objectMode: true,
				write: async (chunk, encoding, next) => {
					try {
						if (first) {
							first = false;
						} else {
							write(',');
						}

						if (flush) {
							flush();
						}

						if (chunk instanceof Batched) {
							// performanc hack, use batch streams ideally

							const str = JSON.stringify(chunk);

							write(str.substring(1, str.length - 1), true);
						} else {
							write(JSON.stringify(chunk), true);
						}

						next();
					} catch (ex) {
						reject(ex);
					}
				}
			});

			incoming.on('end', function () {
				resolve();
			});

			incoming.on('error', function (err) {
				reject(err);
			});

			incoming.pipe(stream);
		} catch (ex) {
			reject(ex);
		}
	});
}

// this can accept almost any type and turn it into a string which is passed to the
// cb method.     It is not optimized to encode objects, so a large object could hinder
// performance
export async function stringify(value, write, onFlush = null): Promise<void> {
	if (value === null || value === undefined) {
		write('null');
	} else if (typeof value === 'object') {
		if (value.pipe) {
			write('[');
			await encode(value, write, onFlush);
			write(']');
		} else if (value.then) {
			const waiting = await value;

			if (onFlush) {
				onFlush();
			}

			return stringify(value, write);
		} else {
			write('{');
			await Object.keys(value).reduce(async (prom: Promise<null>, key, i) => {
				await prom;

				if (i !== 0) {
					write(',');
				}

				write(`"${key}":`);
				return stringify(value[key], write, onFlush);
			}, null);
			write('}');
		}
	} else if (typeof value === 'function') {
		return stringify(value(), write);
	} else {
		write(JSON.stringify(value));
	}
}
