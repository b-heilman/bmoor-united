import {expect} from 'chai';

import {DatumAction} from './action';
import {DatumProcessor} from './processor';
import {Datum} from '../datum';

describe('@bmoor/compute - datum/processor', function () {
	it('should allow computing a value from requirements', async function () {
		const datum = new Datum('something', {
			features: {
				'foo': 1,
				'bar': 2,
				'hello': 3,
				'world': 4
			}
		});

		const child = new DatumAction<{hello: number, world: number}, {}>('hello-world', {
			hello: 'hello',
			world: 'world'
		});

		const top = new DatumProcessor('foo-bar', {
			foo: 'foo',
			bar: 'bar',
			'helloWorld': child
		}, ({foo, bar, helloWorld}) => {
			return <number>foo + <number>bar + helloWorld.hello + helloWorld.world;
		});

		expect(await top.process({}, 'test', [datum])).to.deep.equal([
			10
		]);
	});
});
