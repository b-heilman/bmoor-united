import { listenerCount } from 'process';
import {Transform} from 'stream';

// create a class to act like a wrapper which lets me do detection in other sections
export class Batched<T> extends Array<T> {

}

export function batch<T>(limit = 10, settings = {objectMode: true}) {
	let batch: Batched<T> = new Batched();

    limit = limit - 1; // so I don't need to do >= lower

	return new Transform({
		objectMode: settings.objectMode,
		transform(chunk: T, encoding, next) {
			let called = false;

			batch.push(chunk);

            if (batch.length > limit){
                this.push(batch);
				batch = new Batched();
            }

			next();
		},
		flush: function (callback) {
			if (batch.length) {
				this.push(batch);
			}
			
			callback();
		}
	});
}
