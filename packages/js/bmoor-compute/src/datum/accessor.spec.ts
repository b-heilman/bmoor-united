import {expect} from 'chai';

import {Context} from '@bmoor/context';

import {Datum} from '../datum';
import {DatumAccessor} from './accessor';
import {DatumReader} from './reader';

describe('@bmoor/compute - datum/accessor', function () {
	it('should construct a payload with historical data', async function () {
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

		const child = new DatumReader('hello-world', {
			hello: 'hello',
			world: 'world',
		});

		const top = new DatumAccessor(
			'foo-bar',
			{
				foo: 'foo',
				bar: 'bar',
				helloWorld: child,
			},
			{
				offset: 2,
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
		).to.deep.equal([
			{
				foo: 1,
				bar: 2,
				helloWorld: {
					hello: 3,
					world: 4,
				},
			},
		]);
	});
});
