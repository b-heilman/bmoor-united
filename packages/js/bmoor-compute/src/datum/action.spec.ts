import {expect} from 'chai';

import {DatumAction} from './action';
import {Datum} from '../datum';

describe('@bmoor/compute - datum/action', function () {
	it('should construct a payload', async function () {
		const datum = new Datum('something', {
			features: {
				'foo': 1,
				'bar': 2,
				'hello': 3,
				'world': 4
			}
		});

		const child = new DatumAction('hello-world', {
			hello: 'hello',
			world: 'world'
		});

		const top = new DatumAction('foo-bar', {
			foo: 'foo',
			bar: 'bar',
			'helloWorld': child
		});

		expect(await top.process({}, 'test', [datum])).to.deep.equal([
			{
				foo: 1,
				bar: 2,
				helloWorld: {
					hello: 3,
					world: 4
				}
			}
		])
	});
});
