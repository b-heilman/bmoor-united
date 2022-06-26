import {expect} from 'chai';
import {Readable} from 'stream';

import {pause} from '@bmoor/timing';

import {parallel, promisefy} from './index';

describe('@bmoor/stream', function () {
	describe('parallel', function () {
		it('should call all methods in parallel', async function () {
			const readable = Readable.from([
				{
					eins: 1,
					zwei: 2
				},
				{
					eins: 10,
					zwei: 20
				},
				{
					eins: 100,
					zwei: 200
				}
			]);

			const closures: ((value: unknown) => void)[] = [];

			const data = readable.pipe(
				parallel(async (obj = {eins: 1, zwei: 2}) => {
					await new Promise((resolve) => {
						closures.push(resolve);
					});

					return {
						value: obj.eins + obj.zwei
					};
				})
			);

			await pause(3);

			expect(closures.length).to.equal(3);

			closures.forEach((fn) => fn(true));

			const res = await promisefy(data);

			expect(res).to.deep.equal([
				{
					value: 3
				},
				{
					value: 30
				},
				{
					value: 300
				}
			]);
		});

		it('should respect the limit', async function () {
			const readable = Readable.from([
				{
					eins: 1,
					zwei: 2
				},
				{
					eins: 10,
					zwei: 20
				},
				{
					eins: 100,
					zwei: 200
				}
			]);

			const closures: ((value: unknown) => void)[] = [];

			const data = readable.pipe(
				parallel(async (obj = {eins: 1, zwei: 2}) => {
					await new Promise((resolve) => {
						closures.push(resolve);
					});

					return {
						value: obj.eins + obj.zwei
					};
				}, 2)
			);

			await pause(3);

			expect(closures.length).to.equal(2);

			closures.forEach((fn) => fn(true));

			await pause(3);

			expect(closures.length).to.equal(3);

			closures.forEach((fn) => fn(true));

			const res = await promisefy(data);

			expect(res).to.deep.equal([
				{
					value: 3
				},
				{
					value: 30
				},
				{
					value: 300
				}
			]);
		});
	});
});
