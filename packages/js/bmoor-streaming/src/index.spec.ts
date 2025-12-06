import {expect} from 'chai';
import {Readable} from 'stream';

import {pause} from '@bmoor/timing';

import {batch, parallel, promisefy, stringify} from './index.ts';

describe('@bmoor/stream', function () {
	describe('promisefy', function () {
		it('should work correctly', async function () {
			const prom = promisefy(
				Readable.from([
					{
						eins: 1,
						zwei: 2,
					},
					{
						eins: 10,
						zwei: 20,
					},
					{
						eins: 100,
						zwei: 200,
					},
				]),
			);

			expect(await prom).to.deep.equal([
				{
					eins: 1,
					zwei: 2,
				},
				{
					eins: 10,
					zwei: 20,
				},
				{
					eins: 100,
					zwei: 200,
				},
			]);
		});
	});

	describe('parallel', function () {
		it('should call all methods in parallel', async function () {
			const readable = Readable.from([
				{
					eins: 1,
					zwei: 2,
				},
				{
					eins: 10,
					zwei: 20,
				},
				{
					eins: 100,
					zwei: 200,
				},
			]);

			const closures: ((value: unknown) => void)[] = [];

			const data = readable.pipe(
				parallel(async (obj = {eins: 1, zwei: 2}) => {
					await new Promise((resolve) => {
						closures.push(resolve);
					});

					return {
						value: obj.eins + obj.zwei,
					};
				}),
			);

			await pause(3);

			expect(closures.length).to.equal(3);

			closures.forEach((fn) => fn(true));

			const res = await promisefy(data);

			expect(res).to.deep.equal([
				{
					value: 3,
				},
				{
					value: 30,
				},
				{
					value: 300,
				},
			]);
		});

		it('should respect the limit', async function () {
			const readable = Readable.from([
				{
					eins: 1,
					zwei: 2,
				},
				{
					eins: 10,
					zwei: 20,
				},
				{
					eins: 100,
					zwei: 200,
				},
			]);

			const closures: ((value: unknown) => void)[] = [];

			const data = readable.pipe(
				parallel(async (obj = {eins: 1, zwei: 2}) => {
					await new Promise((resolve) => {
						closures.push(resolve);
					});

					return {
						value: obj.eins + obj.zwei,
					};
				}, 2),
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
					value: 3,
				},
				{
					value: 30,
				},
				{
					value: 300,
				},
			]);
		});
	});

	describe('batch', function () {
		it('should work correctly', async function () {
			const prom = promisefy(
				Readable.from([
					{
						eins: 1,
						zwei: 2,
					},
					{
						eins: 10,
						zwei: 20,
					},
					{
						eins: 100,
						zwei: 200,
					},
				]).pipe(batch(2)),
			);

			expect(await prom).to.deep.equal([
				[
					{
						eins: 1,
						zwei: 2,
					},
					{
						eins: 10,
						zwei: 20,
					},
				],
				[
					{
						eins: 100,
						zwei: 200,
					},
				],
			]);
		});
	});

	describe('stringify', function () {
		it('should work correctly', async function () {
			const agg = await promisefy(
				stringify({
					stream: Readable.from([
						{
							eins: 1,
							zwei: 2,
						},
						{
							eins: 10,
							zwei: 20,
						},
						{
							eins: 100,
							zwei: 200,
						},
					]).pipe(batch(2)),
					number: 1,
					string: '2',
					prom: Promise.resolve({
						hello: 'world',
					}),
					arr: [
						'eins',
						'zwei',
						Promise.resolve('drei'),
						{
							foo: 'bar',
						},
					],
				}),
			);

			const res = JSON.parse(agg.join(''));

			expect(res).to.deep.equal({
				stream: [
					{
						eins: 1,
						zwei: 2,
					},
					{
						eins: 10,
						zwei: 20,
					},
					{
						eins: 100,
						zwei: 200,
					},
				],
				number: 1,
				string: '2',
				prom: {
					hello: 'world',
				},
				arr: [
					'eins',
					'zwei',
					'drei',
					{
						foo: 'bar',
					},
				],
			});
		});
	});
});
