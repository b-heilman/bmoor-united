import {expect} from 'chai';
import {useFakeTimers} from 'sinon';

import {ModelFieldSet, factory} from './set';

describe('@bmoor-modeling.ModelFieldSet', function () {
	let fieldSet: ModelFieldSet = null;
	let clock = null;

	beforeEach(function () {
		clock = useFakeTimers(Date.now());
	});

	afterEach(function () {
		clock.restore();
	});

	describe('typescript', function () {
		it('should work as json', function () {
			fieldSet = factory(
				{
					external: 'path',
					jsonType: 'string'
				},
				{
					external: 'path2',
					internal: 'p2',
					jsonType: 'number'
				}
			);

			expect(fieldSet.toTypescript()).to.deep.equal({
				internal: JSON.stringify(
					{
						path: 'string',
						p2: 'number'
					},
					null,
					'\t'
				),
				external: JSON.stringify(
					{
						path: 'string',
						path2: 'number'
					},
					null,
					'\t'
				)
			});
		});
	});
});
