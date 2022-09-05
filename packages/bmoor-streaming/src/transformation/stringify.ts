import {Readable} from 'stream';

import {stringify as libStringify} from '../lib/stringify';

export function stringify(tgt) {
	let read = false;
	return new Readable({
		read() {
			// TODO: there has to be a better way...
			if (!read) {
				read = true;

				libStringify(tgt, (str) => {
					this.push(str);
				}).then(() => {
					this.emit('end'); // I must not be doing this right?
					this.destroy();
				});
			}
		}
	});
}
