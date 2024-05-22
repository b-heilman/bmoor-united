import {expect} from 'chai';

import {Context} from '@bmoor/context';

import {Datum} from '../datum';
import {DatumProcessor} from './processor';
import {DatumReader} from './reader';

describe('@bmoor/compute - datum/processor', function () {
	it('should allow computing a value from requirements', async function () {
		const datum = new Datum('something', {
			features: {
				foo: 1,
				bar: 2,
				hello: 3,
				world: 4,
			},
		});

		const child = new DatumReader<
			{hello: number; world: number},
			Datum,
			object
		>('hello-world', {
			hello: 'hello',
			world: 'world',
		});

		const top = new DatumProcessor(
			'foo-bar',
			{
				foo: 'foo',
				bar: 'bar',
				helloWorld: child,
			},
			{
				reducer: ({foo, bar, helloWorld}) => {
					return (
						<number>foo + <number>bar + helloWorld.hello + helloWorld.world
					);
				},
			},
		);

		expect(await top.process(new Context({}), {}, [datum])).to.deep.equal([
			10,
		]);
	});
});
