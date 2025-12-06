import {expect} from 'chai';

import {Context} from '@bmoor/context';

import {Datum} from '../datum.ts';
import {DatumReader} from './reader.ts';

describe('@bmoor/compute - datum/action', function () {
	it('should construct a payload', async function () {
		const datum = new Datum('something', {
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

		const top = new DatumReader('foo-bar', {
			foo: 'foo',
			bar: 'bar',
			helloWorld: child,
		});

		expect(await top.process(new Context({}), {}, [datum])).to.deep.equal([
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
