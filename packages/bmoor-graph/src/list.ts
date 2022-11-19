import {Node} from './node';

export class List {
	array: Array<Node>;

	constructor(arr: Array<Node>) {
		this.array = arr;
	}

	bucket(mount: string, bucketCount: number) {
		const arr = this.array;

		if (arr.length) {
			const limit = Math.floor(arr.length / bucketCount);

			arr[0].setWeight(mount, bucketCount);
			for (let i = 1, c = arr.length; i < c; i++) {
				if (i % limit === 0) {
					bucketCount--;
				}

				arr[i].setWeight(mount, bucketCount);
			}
		}
	}
}
