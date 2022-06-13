import {Transform} from 'stream';

export function parallel(fn, limit = 10, settings = {objectMode: true}) {
	let inFlight = 0;
	let onEnd: () => void = null;

	return new Transform({
		objectMode: settings.objectMode,
		async transform(chunk, encoding, next) {
			let called = false;
			inFlight++;

			if (inFlight < limit) {
				next();
				called = true;
			}

			fn(chunk, encoding).then((res) => {
				this.push(res);

				inFlight--;
				if (!called) {
					next();
				}

				if (!inFlight && onEnd) {
					onEnd();
				}
			});
		},
		flush: function (callback) {
			if (!inFlight) {
				callback();
			} else {
				onEnd = callback;
			}
		}
	});
}
