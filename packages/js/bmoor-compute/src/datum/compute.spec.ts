import {expect} from 'chai';

import {Context} from '@bmoor/context';

import {Datum} from '../datum';
import {DatumAction} from './action';
import {DatumCompute} from './compute';

describe('@bmoor/compute - datum/compute', function () {
	it('should compute a value with historical data', async function () {
		const datumNow = new Datum('something-now', {
			features: {
				foo: 10,
				bar: 20,
				hello: 30,
				world: 40,
			},
		});

		const datumPast = new Datum('something-then', {
			features: {
				foo: 1,
				bar: 2,
				hello: 3,
				world: 4,
			},
		});

		const child = new DatumAction<
			{hello: number; world: number},
			Datum,
			object
		>('hello-world', {
			hello: 'hello',
			world: 'world',
		});

		const top = new DatumCompute(
			'foo-bar',
			{
				foo: 'foo',
				bar: 'bar',
				helloWorld: child,
			},
			{
				offset: 2,
				reducer: (data: {
					foo: number;
					bar: number;
					helloWorld: {hello: number; world: number};
				}) => {
					return (
						data.foo +
						data.bar +
						data.helloWorld.hello +
						data.helloWorld.world
					);
				},
			},
		);

		expect(
			await top.process(
				new Context({}),
				{
					offset: (datum, shift, strict) => {
						expect(datum).to.equal(datumNow);
						expect(shift).to.equal(2);
						expect(strict).to.equal(false);

						return datumPast;
					},
				},
				[datumNow],
			),
		).to.deep.equal([10]);
	});
});